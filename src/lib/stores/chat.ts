import { Chat } from 'lib/models/chat'
import { ChatMessage } from 'lib/models/message'
import { create } from 'zustand'
import { getAccount } from './user'
import { isMessageEmpty } from 'lib/utils/message'
import { $getRoot, $getSelection, LexicalEditor } from 'lexical'
import { Suggestion } from 'lib/models/suggestions'
import { replaceAll } from 'lib/utils/string'
import { API_URL } from 'lib/constants'
import { checkResponseError } from 'lib/utils/fetch'
import { getAuthHeaders } from 'lib/utils/token'

export type InputState = 'loading' | 'disabled' | 'send' | 'interrupt'

type ChatStore = {
  chats: Chat[]
  totalChats: number
  chatsOffset: number
  currentChatId: string
  currentChatMessages: ChatMessage[]
  loadingMessages: boolean
  chatEditor: LexicalEditor | null
  suggestions: Suggestion[]
  inputState: Map<string, InputState>
  setChatEditor: (input: LexicalEditor) => void
  setChatInput: (input: string) => void
  setChats: (chats: Chat[]) => void
  setInputState: (id: string, state: InputState) => void
  updateDisabledState: (id: string) => void
  createNewChat: () => void
  setCurrentChatId: (id: string, updateMessages?: boolean) => void
  setCurrentChatMessages: (data: ChatMessage[]) => void
  setLoadingMessages: (loading: boolean) => void
  updateChatMessage: (
    id: string,
    responseIndex: number,
    message: ChatMessage,
  ) => void
  sendMessage: (message: string) => void
  addChatMessage: (message: ChatMessage) => void
  removeChatMessage: (id: string) => void
  removeLoadingMessage: (chatId: string) => void
  addChat: (chat: Chat) => void
  updateChat: (id: string, chat: Chat) => void
  removeChat: (id: string) => void
  fetchChats: () => void
  fetchChatMessages: () => void
  deleteChat: (id: string) => void
  removeTemporaryMessages: (chatId: string) => void
  fetchSuggestions: () => void
  handleStreamEnd: (chatId: string) => void
  fetchChatUpdate: (id: string) => void
  handleResponse: (
    response: Response,
    tempChatId: string,
    tempMessageId: string,
  ) => Promise<void>
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  chats: [],
  totalChats: 0,
  chatsOffset: 0,
  currentChatId: '',
  currentChatMessages: [],
  loadingMessages: false,
  chatEditor: null,
  suggestions: [],
  inputState: new Map<string, InputState>([['', 'disabled']]),
  setInputState: (id, state) => {
    const inputState = get().inputState
    inputState.set(id, state)
    return set({ inputState: inputState })
  },
  setChatEditor: (input) => set({ chatEditor: input }),
  setChatInput: (input) => {
    const editor = get().chatEditor
    editor?.update(() => {
      const root = $getRoot()
      root.clear()
      const selection = $getSelection()
      if (selection) {
        selection.insertText(input)
      }
    })
  },
  setChats: (chats) =>
    set({
      chats: chats?.sort(
        (a, b) =>
          Date.parse(b.last_modified_at) - Date.parse(a.last_modified_at),
      ),
    }),
  createNewChat: () => {
    get().setCurrentChatId('')
  },
  setCurrentChatId: (currentChatId, updateMessages = true) => {
    set({ currentChatId: currentChatId })
    if (updateMessages !== false) {
      get().fetchChatMessages()
    }
    if (get().inputState.get(currentChatId) === undefined) {
      get().setInputState(currentChatId, 'disabled')
    }
    window.parent.postMessage({ currentChatId }, '*')
  },
  addChat: (chat) => {
    if (!get().chats.find((c) => c.id === chat.id)) {
      set((state) => {
        state.chats = [chat, ...state.chats]
        return {
          chats: state.chats,
          totalChats: state.totalChats + 1,
          chatsOffset: state.chatsOffset + 1,
        }
      })
    }
  },
  updateChat: (id, chat) => {
    set((state) => {
      const index = state.chats.findIndex((chat) => chat.id === id)
      state.chats[index] = chat
      return { chats: state.chats }
    })
  },
  removeChat: (id) => {
    set((state) => {
      state.chats = state.chats.filter((chat) => chat.id !== id)
      return { chats: state.chats }
    })
  },
  setCurrentChatMessages: (currentChatMessages) =>
    set({
      currentChatMessages: currentChatMessages
        .filter((message) => !isMessageEmpty(message))
        .reverse(),
    }),
  setLoadingMessages: (loading) => set({ loadingMessages: loading }),
  addChatMessage: (message) => {
    set((state) => {
      state.currentChatMessages = state.currentChatMessages
        ? [...state.currentChatMessages, message]
        : [message]
      return { currentChatMessages: state.currentChatMessages }
    })
  },
  removeChatMessage: (id) => {
    set((state) => {
      state.currentChatMessages = state.currentChatMessages?.filter(
        (message) => message.id !== id,
      )
      return { currentChatMessages: state.currentChatMessages }
    })
  },
  removeLoadingMessage: (chatId) => {
    set((state) => {
      state.currentChatMessages = state.currentChatMessages?.filter(
        (message) =>
          message.render_type !== 'LOADING' || message.chat_id !== chatId,
      )
      return { currentChatMessages: state.currentChatMessages }
    })
  },
  updateChatMessage: (id, responseIndex, message) => {
    set((state) => {
      if (!isMessageEmpty(message)) {
        const index =
          state.currentChatMessages?.findIndex(
            (message) =>
              message.id === id && message.response_index === responseIndex,
          ) ?? -1

        if (index < 0) state.currentChatMessages.push(message)
        state.currentChatMessages[index] = message
      }
      return { currentChatMessages: [...state.currentChatMessages] }
    })
  },
  fetchChats: async () => {
    try {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/chat/?sort_by=last_modified_at&limit=20&offset=${get().chatsOffset}&sort_ascending=false`,
        {
          credentials: 'include',
          headers: getAuthHeaders(),
        },
      )
      checkResponseError(response)
      const data = await response.json()
      const newChats: Chat[] = data.data.filter(
        (chat: Chat) => !get().chats.find((c) => c.id === chat.id),
      )
      const chats = [...get().chats, ...newChats].sort(
        (a: Chat, b: Chat) =>
          Date.parse(b.last_modified_at) - Date.parse(a.last_modified_at),
      )
      set({
        totalChats: data.total,
        chatsOffset: chats.length,
        chats: chats,
      })
    } catch (e: any) {
      console.error('Failed to fetch chats:', e.message)
    }
  },
  fetchChatUpdate: async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/chat/${id}`,
        {
          credentials: 'include',
          headers: getAuthHeaders(),
        },
      )
      checkResponseError(response)
      const data = await response.json()
      get().updateChat(id, data)
    } catch (e: any) {
      console.error('Failed to fetch chat update:', e.message)
    }
  },
  fetchChatMessages: async () => {
    const state = useChatStore.getState()
    if (!state.chats.find((chat) => chat.id === state.currentChatId)) {
      set({ currentChatMessages: [] })
      return
    }
    set({ loadingMessages: true })
    try {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/chat/${state.currentChatId}/messages?limit=1000`,
        {
          credentials: 'include',
          headers: getAuthHeaders(),
        },
      )
      checkResponseError(response)
      const data = await response.json()
      get().setCurrentChatMessages(data.data)
    } catch (e: any) {
      console.error('Failed to fetch chat messages:', e.message)
    }
    set({ loadingMessages: false })
  },
  deleteChat: async (id) => {
    try {
      await fetch(`${API_URL}/v3/orgs/${getAccount()}/chat/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      })
      set((state) => {
        state.chats = state.chats.filter((chat) => chat.id !== id)

        return {
          chats: state.chats,
          totalChats: state.totalChats - 1,
          offset: state.chatsOffset - 1,
        }
      })
      if (get().currentChatId === id) {
        get().createNewChat()
      }
    } catch (e: any) {
      console.error(e.message)
    }
  },
  fetchSuggestions: async () => {
    try {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/data_assets/suggestions`,
        {
          credentials: 'include',
          headers: getAuthHeaders(),
        },
      )
      checkResponseError(response)
      const data = await response.json()
      set({ suggestions: data })
    } catch (e: any) {
      console.error('Failed to fetch account suggestions:', e.message)
    }
  },
  removeTemporaryMessages: (chatId: string) => {
    set((state) => {
      state.currentChatMessages = state.currentChatMessages?.filter(
        (message) =>
          message.render_type !== 'TEMPORARY' || message.chat_id !== chatId,
      )
      return { currentChatMessages: state.currentChatMessages }
    })
  },
  updateDisabledState: (id: string) => {
    const inputState = get().inputState.get(id)
    if (isContentEmpty()) {
      if (inputState === 'send') {
        get().setInputState(id, 'disabled')
      }
    } else {
      if (inputState === 'disabled') {
        get().setInputState(id, 'send')
      }
    }
  },
  sendMessage: async (message) => {
    const currentChatId = useChatStore.getState().currentChatId
    get().setInputState(currentChatId, 'loading')

    const tempChatId = `temp-${uuidv4()}`
    const tempMessageId = `temp-${uuidv4()}`

    get().addChatMessage({
      id: tempMessageId,
      chat_id: currentChatId,
      markdown: message,
      sending_agent: 'user',
      receiving_agent: 'planner_agent',
      response_index: 0,
      timestamp: new Date().toISOString(),
      render_type: 'STANDARD',
    })

    get().addChatMessage({
      id: 'loading', // used to show loading
      chat_id: currentChatId,
      markdown: 'Getting answer',
      sending_agent: 'planning_agent',
      receiving_agent: 'user',
      response_index: 0,
      timestamp: new Date().toISOString(),
      render_type: 'LOADING',
      streaming: true,
    })

    const body: {
      message_text: string
      chat_id?: string | null
    } = {
      message_text: message,
    }

    if (currentChatId) {
      body['chat_id'] = currentChatId
    }
    get().removeTemporaryMessages(currentChatId)
    if (get().currentChatId === '') {
      get().setInputState('', 'disabled')
      get().setCurrentChatId(tempChatId, false)
      get().setInputState(tempChatId, 'loading')
      get().addChat({
        id: tempChatId,
        name: 'Untitled Chat',
        last_modified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        creator_id: 'app',
      })
    } else {
      get().setInputState(get().currentChatId, 'interrupt')
    }

    const response = await fetch(
      `${API_URL}/v3/orgs/${getAccount()}/messages/`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
      },
    )

    await get().handleResponse(response, tempChatId, tempMessageId)
  },
  handleStreamEnd: async (chatId: string) => {
    get().setInputState(chatId, 'send')
    get().removeTemporaryMessages(chatId)
    get().fetchChatUpdate(chatId)
    if (chatId === get().currentChatId) {
      set({
        currentChatMessages: get()
          .currentChatMessages.filter((message) => message.chat_id === chatId)
          .map((message) => ({ ...message, streaming: false })),
      })
    }
  },
  handleResponse: async (
    response: Response,
    tempChatId: string,
    tempMessageId: string,
  ) => {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')

    let thisChatId = tempChatId

    if (!reader) {
      console.error('No reader found')
      return
    }

    let bufferedChunk = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        get().handleStreamEnd(thisChatId)
        break
      }

      let chunk: string = decoder.decode(value, { stream: true })

      try {
        const subchunks = replaceAll(chunk, 'data: ', '')
          .split('\r\n')
          .map((subchunk) => subchunk.trim())
          .filter((subchunk) => subchunk && !subchunk.startsWith(': ping'))

        for (const subchunk of subchunks) {
          let message: ChatMessage
          try {
            message = JSON.parse(subchunk)
          } catch (e) {
            bufferedChunk += subchunk

            try {
              message = JSON.parse(bufferedChunk)
              bufferedChunk = ''
            } catch (e) {
              console.error('Error parsing subchunk \n', bufferedChunk, '\n', e)
              continue
            }
          }

          // We remove the temporary chat and replace it with the chat data given by the api
          if (message.chat_id && thisChatId === tempChatId) {
            const currentInputState = get().inputState.get(tempChatId)
            const response = await fetch(
              `${API_URL}/v3/orgs/${getAccount()}/chat/${message.chat_id}`,
              {
                credentials: 'include',
                headers: getAuthHeaders(),
              },
            )
            const data = await response.json()
            data.name ??= 'Untitled Chat'
            get().setInputState(message.chat_id, currentInputState ?? 'send')
            get().updateChat(tempChatId, data)

            if (get().currentChatId === tempChatId) {
              get().setCurrentChatId(message.chat_id, false)
            }

            thisChatId = message.chat_id
            get().setInputState(message.chat_id, 'interrupt')
          }

          if (
            message.chat_id !== get().currentChatId &&
            get().currentChatId !== tempChatId
          ) {
            continue
          }

          get().updateDisabledState(message.chat_id)

          if (message.sending_agent !== 'user') {
            if (!isMessageEmpty(message)) {
              get().removeLoadingMessage(message.chat_id)
            }

            message.streaming = true
            get().updateChatMessage(
              message.id ?? '',
              message.response_index,
              message,
            )
          } else {
            get().updateChatMessage(tempMessageId, 0, message)
          }
        }
      } catch (error) {
        console.error('Error parsing chunk', error)
      }
    }
  },
}))

export const getContent = () => {
  const editor = useChatStore.getState().chatEditor
  const stringifiedEditorState = JSON.stringify(
    editor?.getEditorState().toJSON(),
  )
  const parsedEditorState = editor?.parseEditorState(stringifiedEditorState)

  const editorStateTextString = parsedEditorState?.read(() =>
    $getRoot().getTextContent(),
  )

  return editorStateTextString ?? ''
}

export const clearContent = () => {
  const editor = useChatStore.getState().chatEditor

  editor?.update(() => {
    const root = $getRoot()
    root.clear()
  })
}

export const isContentEmpty = () => {
  const content = getContent()?.trim()
  return content?.length === 0
}

function uuidv4() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  )
}
