import { create } from 'zustand'

import {
  type ChatApiResponse,
  ChatsSort,
  cloneChat,
  deleteChat,
  getChat,
  getChatMessages,
  getChats,
  type MessageApiSendV3,
  RenderType,
  type SuggestionApi,
  updateChat,
} from '@ns/public-api'
import { isMessageEmpty } from '@ns/ui/utils/isMessageEmpty'
import { replaceAll } from '@ns/ui/utils/replaceAll'

import { API_URL } from 'lib/constants'
import { type ChatMessage } from 'lib/models/message'
import { getAuthHeaders } from 'lib/utils/token'

import { getAccount } from './user'

export type InputState = 'loading' | 'disabled' | 'send' | 'interrupt'

type ChatStore = {
  chats: ChatApiResponse[]
  totalChats: number
  chatsOffset: number
  currentChat: ChatApiResponse | null
  currentChatMessages: ChatMessage[]
  loadingMessages: boolean
  inputValue: string
  inputState: Map<string, InputState>
  isReadOnlyChat: boolean
  chatIdUpdates: Map<string, string>
  isFeedbackRestarting: boolean
  getUpdatedChatId: (id: string) => string
  updateChatId: (oldId: string, newId: string) => Promise<void>
  setInputValue: (input: string) => void
  setInputState: (id: string, state: InputState) => void
  updateDisabledState: (id: string) => void
  createNewChat: () => void
  setCurrentChat: (
    chat: ChatApiResponse | null,
    updateMessages?: boolean,
  ) => void
  setCurrentChatMessages: (data: ChatMessage[]) => void
  setLoadingMessages: (loading: boolean) => void
  setIsReadOnlyChat: (readOnly: boolean) => void
  updateChatMessage: (
    id: string,
    responseIndex: number,
    message: ChatMessage,
  ) => void
  sendMessage: (message: string, deepResearch?: boolean, file?: File) => void
  addChatMessage: (message: ChatMessage) => void
  removeChatMessage: (id: string) => void
  removeLoadingMessage: (chatId: string) => void
  addChat: (chat: ChatApiResponse) => void
  updateLocalChatState: (id: string, chat: ChatApiResponse) => void
  updateChat: (id: string, chat: ChatApiResponse) => Promise<void>
  removeChat: (id: string) => void
  fetchChats: () => void
  fetchChatMessages: () => void
  deleteChat: (id: string) => void
  cloneChat: (id: string) => void
  removeTemporaryMessages: (chatId: string) => void
  postMessage: (
    body: string,
    chatId: string,
    tempMessageId: string,
    attempt?: number,
    file?: File,
  ) => void
  handleStreamEnd: (chatId: string) => void
  handleStreamFail: (chatId: string) => void
  fetchChatUpdate: (id: string) => void
  handleResponse: (
    response: Response,
    chatId: string,
    tempMessageId: string,
  ) => Promise<void>
  activeFeedbackId: string | null
  setActiveFeedback: (messageId: string | null) => void
  updateAdminFeedback: (
    userMessageId: string,
    isPositive?: boolean | null,
  ) => void
  restartChat: () => Promise<void>
  setIsFeedbackRestarting: (value: boolean) => void
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  chats: [],
  totalChats: 0,
  chatsOffset: 0,
  currentChat: null,
  currentChatMessages: [],
  loadingMessages: false,
  inputValue: '',
  inputState: new Map<string, InputState>([['', 'disabled']]),
  isReadOnlyChat: true,
  chatIdUpdates: new Map<string, string>(),
  isFeedbackRestarting: false,
  getUpdatedChatId: (id) => get().chatIdUpdates.get(id) ?? id,
  updateChatId: async (oldId, newId) => {
    const { chatIdUpdates } = get()
    chatIdUpdates.set(oldId, newId)
    set({ chatIdUpdates })
    const inputState = get().inputState.get(oldId)
    const data = await getChat({ accountName: getAccount(), chatId: newId })
    data.name ??= 'Untitled Chat'
    get().setInputState(newId, inputState ?? 'send')
    get().addChat(data)
    get().removeChat(oldId)

    if (get().currentChat?.id === oldId) {
      get().setCurrentChat(data, false)
    }
  },
  setInputValue: (inputValue) => {
    set({ inputValue })
    get().updateDisabledState(get().currentChat?.id ?? '')
  },
  setInputState: (id, state) => {
    const { inputState } = get()
    inputState.set(id, state)
    return set({ inputState })
  },
  createNewChat: () => {
    get().setCurrentChat(null)
    get().setInputValue('')
  },
  setCurrentChat: (currentChat, updateMessages = true) => {
    set({ currentChat })
    if (updateMessages !== false) {
      get().fetchChatMessages()
    }
    if (currentChat && get().inputState.get(currentChat.id) === undefined) {
      get().setInputState(currentChat.id, 'disabled')
    }
    const currentChatId = currentChat?.id ?? ''
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
  updateLocalChatState: (id, chat) => {
    set((state) => {
      const index = state.chats.findIndex((chat) => chat.id === id)
      state.chats[index] = chat
      if (id === state.currentChat?.id) state.currentChat = chat
      return { chats: state.chats, currentChat: state.currentChat }
    })
  },
  updateChat: async (id: string, updatedChat: ChatApiResponse) => {
    try {
      const data = await updateChat({
        accountName: getAccount(),
        chatId: id,
        data: { chat_name: updatedChat.name ?? '' },
      })
      get().updateLocalChatState(id, data)
    } catch (error) {
      console.error('Failed to update chat:', error)
      throw error
    }
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
  setIsReadOnlyChat: (readOnly) => set({ isReadOnlyChat: readOnly }),
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
  removeLoadingMessage: () => {
    set((state) => {
      state.currentChatMessages = state.currentChatMessages?.filter(
        (message) => message.render_type !== 'LOADING',
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
      const allChatsData = await getChats({
        accountName: getAccount(),
        params: {
          sort_by: ChatsSort.last_modified_at,
          limit: 20,
          offset: get().chatsOffset,
          sort_ascending: false,
        },
      })
      const newChats: ChatApiResponse[] = allChatsData.data.filter(
        (chat) => !get().chats.find((c) => c.id === chat.id),
      )
      const chats = [...get().chats, ...newChats].sort(
        (a, b) =>
          Date.parse(b.last_modified_at) - Date.parse(a.last_modified_at),
      )
      set({
        totalChats: allChatsData.total,
        chatsOffset: chats.length,
        chats,
      })
    } catch (error: any) {
      console.error('Failed to fetch chats:', error.message)
    }
  },
  fetchChatUpdate: async (id) => {
    try {
      const data = await getChat({ accountName: getAccount(), chatId: id })
      get().updateLocalChatState(id, data)
    } catch (error) {
      console.error('Failed to fetch chat update:', error)
    }
  },
  fetchChatMessages: async () => {
    const state = useChatStore.getState()
    if (!state.currentChat) {
      set({ currentChatMessages: [] })
      return
    }
    set({ loadingMessages: true })
    try {
      const response = await getChatMessages({
        accountName: getAccount(),
        chatId: state.currentChat.id,
        params: { limit: 1000 },
      })
      const messageWithFeedback = response.data.find(
        (message) => message.is_positive_admin_feedback === true,
      )
      get().setCurrentChatMessages(response.data)
      if (messageWithFeedback) {
        get().setActiveFeedback(messageWithFeedback.id)
      }
    } catch (error) {
      console.error('Failed to fetch chat messages:', error)
    }
    set({ loadingMessages: false })
  },
  deleteChat: async (id) => {
    try {
      await deleteChat({ accountName: getAccount(), chatId: id })
      set((state) => {
        state.chats = state.chats.filter((chat) => chat.id !== id)

        return {
          chats: state.chats,
          totalChats: state.totalChats - 1,
          offset: state.chatsOffset - 1,
        }
      })
      if (get().currentChat?.id === id) {
        get().createNewChat()
      }
    } catch (error) {
      console.error(error)
    }
  },
  cloneChat: async (id) => {
    try {
      const data = await cloneChat({ accountName: getAccount(), chatId: id })
      get().addChat(data)
      get().setCurrentChat(data)
    } catch (error) {
      console.error('Failed to clone chat:', error)
    }
  },
  removeTemporaryMessages: (chatId: string) => {
    set((state) => {
      state.currentChatMessages = state.currentChatMessages?.filter(
        (message) =>
          message.render_type !== RenderType.TEMPORARY ||
          message.chat_id !== chatId,
      )
      return { currentChatMessages: state.currentChatMessages }
    })
  },
  updateDisabledState: (id: string) => {
    const inputState = get().inputState.get(id)
    if (get().inputValue === '') {
      if (inputState === 'send') {
        get().setInputState(id, 'disabled')
      }
    } else if (inputState === 'disabled') {
      get().setInputState(id, 'send')
    }
  },
  sendMessage: async (message: string, deepResearch?: boolean, file?: File) => {
    if (get().isFeedbackRestarting) {
      const tempMessageId = `temp-${uuidv4()}`
      const chatId = get().currentChat?.id ?? `temp-${uuidv4()}`
      get().removeTemporaryMessages(chatId)
      get().addChatMessage({
        id: tempMessageId,
        chat_id: chatId,
        markdown: message,
        sending_agent: 'user',
        response_index: 0,
        timestamp: new Date().toISOString(),
        render_type: RenderType.STANDARD,
      })
      const loadingMessageId = 'loading'
      get().addChatMessage({
        id: loadingMessageId,
        chat_id: chatId,
        markdown: 'Getting answer',
        sending_agent: 'planning_agent',
        response_index: 0,
        timestamp: new Date().toISOString(),
        render_type: 'LOADING',
        streaming: true,
      })
      window.parent.postMessage(
        {
          type: 'FEEDBACK_RESTART_MESSAGE',
          chatId,
          message_text: message,
        },
        '*',
      )
      set({ isFeedbackRestarting: false })
      return
    }

    const tempMessageId = `temp-${uuidv4()}`
    const chatId = get().currentChat?.id ?? `temp-${uuidv4()}`
    get().setInputState(chatId, 'loading')
    get().removeTemporaryMessages(chatId)

    // Eagerly add the user message to the chat
    get().addChatMessage({
      id: tempMessageId,
      chat_id: chatId,
      markdown: message,
      sending_agent: 'user',
      response_index: 0,
      timestamp: new Date().toISOString(),
      render_type: RenderType.STANDARD,
    })

    get().addChatMessage({
      id: 'loading', // used to show loading
      chat_id: chatId,
      markdown: 'Getting answer',
      sending_agent: 'planning_agent',
      response_index: 0,
      timestamp: new Date().toISOString(),
      render_type: 'LOADING',
      streaming: true,
    })

    const body: MessageApiSendV3 = {
      message_text: message,
      deep_research_mode: deepResearch,
    }

    if (get().currentChat?.id) {
      body.chat_id = chatId
      get().setInputState(chatId, 'interrupt')
    } else {
      get().setInputState(chatId, 'disabled')
      const tempChat = {
        id: chatId,
        name: 'Untitled Chat',
        last_modified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        creator: {
          id: '',
          name: '',
          avatar: null,
        },
        is_feedback_chat: false,
      }
      get().addChat(tempChat)
      get().setCurrentChat(tempChat, false)
      get().setInputState(chatId, 'loading')
    }
    get().postMessage(JSON.stringify(body), chatId, tempMessageId, 0, file)
  },
  postMessage: async (
    body: string,
    chatId: string,
    tempMessageId: string,
    attempt: number = 0,
    file?: File,
  ) => {
    try {
      if (attempt > 0) {
        // If we are trying to reconnect we don't send message text.
        body = JSON.stringify({
          message_text: null,
          chat_id: get().getUpdatedChatId(chatId),
        })
      }
      const formData = new FormData()
      formData.append('message_in', body)
      if (file) formData.append('csv_file', file)
      const response = await fetch(
        `${API_URL}/api/v3/orgs/${getAccount()}/messages/with_attachment`,
        {
          method: 'POST',
          body: formData,
          headers: getAuthHeaders(),
          credentials: 'include',
        },
      )
      if (response.status === 201 || response.status === 409) {
        await get().handleResponse(response, chatId, tempMessageId)
      } else {
        get().handleStreamFail(get().getUpdatedChatId(chatId))
      }
    } catch (error) {
      if (attempt < 5) {
        // Recursively try to reconnect w/ exponential backoff
        setTimeout(
          () => {
            get().postMessage(body, chatId, tempMessageId, attempt + 1, file)
          },
          2 ** attempt * 250,
        )
      } else {
        get().handleStreamFail(get().getUpdatedChatId(chatId))
      }
    }
  },
  handleStreamEnd: async (chatId: string) => {
    get().setInputState(chatId, get().inputValue ? 'send' : 'disabled')
    get().removeTemporaryMessages(chatId)
    get().fetchChatUpdate(chatId)
    if (chatId === get().currentChat?.id) {
      set({
        currentChatMessages: get()
          .currentChatMessages.filter((message) => message.chat_id === chatId)
          .map((message) => ({ ...message, streaming: false })),
      })
    }
  },
  handleStreamFail: async (chatId: string) => {
    get().setInputState(chatId, get().inputValue ? 'send' : 'disabled')
    get().removeTemporaryMessages(chatId)
    get().removeLoadingMessage(chatId)
    get().fetchChatMessages()
  },
  handleResponse: async (
    response: Response,
    chatId: string,
    tempMessageId: string,
  ) => {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')

    let thisChatId = chatId

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

      const chunk: string = decoder.decode(value, { stream: true })

      try {
        const subchunks = replaceAll(chunk, 'data: ', '')
          .split('\r\n')
          .map((subchunk) => subchunk.trim())
          .filter((subchunk) => subchunk && !subchunk.startsWith(': ping'))

        for (const subchunk of subchunks) {
          let message: ChatMessage
          try {
            message = JSON.parse(subchunk)
          } catch {
            bufferedChunk += subchunk

            try {
              message = JSON.parse(bufferedChunk)
              bufferedChunk = ''
            } catch (error) {
              console.error(
                'Error parsing subchunk \n',
                bufferedChunk,
                '\n',
                error,
              )
              continue
            }
          }

          // We remove the temporary chat and replace it with the chat data given by the api
          if (message.chat_id && thisChatId !== message.chat_id) {
            await get().updateChatId(thisChatId, message.chat_id)
            thisChatId = message.chat_id
            get().setInputState(thisChatId, 'interrupt')
          }

          if (message.chat_id !== get().currentChat?.id) {
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
              message.response_index ?? 0,
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
  activeFeedbackId: null,
  setActiveFeedback: (messageId) => set({ activeFeedbackId: messageId }),
  updateAdminFeedback: (userMessageId: string, isPositive?: boolean | null) => {
    set((state) => ({
      currentChatMessages: state.currentChatMessages.map((msg) => {
        if (msg.id === userMessageId) {
          return {
            ...msg,
            is_positive_admin_feedback:
              isPositive === null ? undefined : isPositive,
          }
        }
        if (msg.is_positive_admin_feedback) {
          return { ...msg, is_positive_admin_feedback: undefined }
        }
        return msg
      }),
    }))
  },
  restartChat: async () => {
    const state = get()
    if (state.currentChat?.id) state.fetchChatUpdate(state.currentChat?.id)
    state.fetchChatMessages()
  },
  setIsFeedbackRestarting: (value: boolean) =>
    set({ isFeedbackRestarting: value }),
}))

function uuidv4() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  )
}
