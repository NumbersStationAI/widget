import { $getRoot, type LexicalEditor } from 'lexical'
import { create } from 'zustand'

import { getChatMessages, RenderType } from '@ns/public-api'
import { isMessageEmpty } from '@ns/ui/utils/isMessageEmpty'
import { replaceAll } from '@ns/ui/utils/replaceAll'

import { API_URL } from 'lib/constants'
import { type ChatMessage } from 'lib/models/message'
import { getAuthHeaders } from 'lib/utils/token'

import { type InputState } from './chat'
import { getAccount } from './user'

interface PanelChatState {
  feedbackChatId: string | null
  currentPanelMessages: ChatMessage[]
  loadingPanelMessages: boolean
  feedbackEditor: LexicalEditor | null
  inputState: Map<string, InputState>
  activeInstructionId: string | null
  activeinstructionName: string | null
  activeStreamController: AbortController | null
  activeMessagesController: AbortController | null
  abortStream: () => void
  abortMessagesRequest: () => void
  setFeedbackEditor: (editor: LexicalEditor) => void
  setFeedbackChatId: (id: string | null) => void
  setCurrentPanelMessages: (messages: ChatMessage[]) => void
  setLoadingPanelMessages: (loading: boolean) => void
  fetchStreamingMessages: (instructionId: string) => Promise<void>
  fetchPanelMessages: (chatId?: string) => Promise<void>
  sendFeedbackMessage: (content: string) => Promise<void>
  addFeedbackMessage: (message: ChatMessage) => void
  removePanelLoadingMessage: (chatId: string) => void
  updateFeedbackMessage: (
    id: string,
    responseIndex: number,
    message: ChatMessage,
  ) => void
  setInputState: (id: string, state: InputState) => void
  handleStreamingResponse: (
    response: Response,
    tempMessageId: string,
  ) => Promise<void>
  handleStreamEnd: () => void
  updateDisabledState: (id: string) => void
  updateAdminFeedback: (
    userMessageId: string,
    isPositive?: boolean | null,
  ) => void
  setActiveInstructionId: (id: string | null) => void
  setActiveinstructionName: (name: string | null) => void
}

export const usePanelChatStore = create<PanelChatState>((set, get) => ({
  feedbackChatId: null,
  loadingPanelMessages: false,
  feedbackEditor: null,
  currentPanelMessages: [],
  activeInstructionId: null,
  activeinstructionName: null,
  activeStreamController: null,
  activeMessagesController: null,
  setFeedbackEditor: (editor) => set({ feedbackEditor: editor }),
  abortMessagesRequest: () => {
    if (get().activeMessagesController) {
      get().activeMessagesController?.abort()
      set({ activeMessagesController: null })
    }
  },
  abortStream: () => {
    if (get().activeStreamController) {
      get().activeStreamController?.abort()
      set({ activeStreamController: null })
    }
  },
  setCurrentPanelMessages: (messages) =>
    set({
      currentPanelMessages: messages
        .filter((message) => !isMessageEmpty(message))
        .reverse(),
    }),
  setFeedbackChatId: (id) => {
    set({ feedbackChatId: id })
    if (id) {
      get().fetchPanelMessages()
    }
  },
  setLoadingPanelMessages: (loading) => set({ loadingPanelMessages: loading }),
  fetchPanelMessages: async (chatId?: string) => {
    const targetChatId = chatId || get().feedbackChatId
    if (!targetChatId) {
      set({ currentPanelMessages: [] })
      return
    }
    get().abortMessagesRequest()
    const controller = new AbortController()
    set({ activeMessagesController: controller })

    set({ loadingPanelMessages: true })
    try {
      const response = await getChatMessages(
        {
          accountName: getAccount(),
          chatId: targetChatId,
          params: { limit: 1000 },
        },
        {
          signal: controller.signal,
        },
      )
      if (!controller.signal.aborted) {
        // TODO Remove this type assertion once the types are compatible. This is
        // likely due to missing nested types in the public OpenAPI JSON.
        const data = response as { data: ChatMessage[] }
        get().setCurrentPanelMessages(data.data)
      }
    } catch (e) {
      console.error('Failed to fetch feedback messages:', e)
    } finally {
      if (get().activeMessagesController === controller) {
        set({ activeMessagesController: null })
      }
      set({ loadingPanelMessages: false })
    }
  },
  addFeedbackMessage: (message) => {
    set((state) => ({
      currentPanelMessages: [...state.currentPanelMessages, message],
    }))
  },
  removePanelLoadingMessage: () => {
    set((state) => {
      state.currentPanelMessages = state.currentPanelMessages?.filter(
        (message) => message.render_type !== 'LOADING',
      )
      return { currentPanelMessages: state.currentPanelMessages }
    })
  },
  updateFeedbackMessage: (
    id: string,
    responseIndex: number,
    message: ChatMessage,
  ) => {
    set((state) => {
      if (!isMessageEmpty(message)) {
        const index = state.currentPanelMessages.findIndex(
          (msg) => msg.id === id && msg.response_index === responseIndex,
        )
        if (index < 0) {
          state.currentPanelMessages.push(message)
        } else {
          state.currentPanelMessages[index] = message
        }
      }
      return { currentPanelMessages: [...state.currentPanelMessages] }
    })
  },
  inputState: new Map<string, InputState>([['', 'disabled']]),
  setInputState: (id, state) => {
    const { inputState } = get()
    inputState.set(id, state)
    set({ inputState })
  },
  updateDisabledState: (id: string) => {
    const inputState = get().inputState.get(id)
    if (isFeedbackContentEmpty()) {
      if (inputState === 'send') {
        get().setInputState(id, 'disabled')
      }
    } else if (inputState === 'disabled') {
      get().setInputState(id, 'send')
    }
  },
  handleStreamingResponse: async (
    response: Response,
    tempMessageId: string,
  ) => {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')
    let bufferedChunk = ''
    if (!reader) {
      console.error('No reader found')
      return
    }
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        get().handleStreamEnd()
        break
      }
      const chunk = decoder.decode(value, { stream: true })
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
              continue
            }
          }
          if (message.render_type === RenderType.NONE) {
            get().removePanelLoadingMessage(message.chat_id)
          } else if (message.sending_agent !== 'user') {
            if (!isMessageEmpty(message)) {
              get().removePanelLoadingMessage(message.chat_id)
            }
            message.streaming = true
            get().updateFeedbackMessage(
              message.id ?? '',
              message.response_index ?? 0,
              message,
            )
          } else {
            get().updateFeedbackMessage(tempMessageId, 0, message)
          }
          get().updateDisabledState(message.chat_id)
        }
      } catch (error) {
        console.error('Error parsing feedback chunk', error)
      }
    }
  },
  fetchStreamingMessages: async (instructionId: string) => {
    get().abortStream()
    set({ activeInstructionId: instructionId })
    const controller = new AbortController()
    set({ activeStreamController: controller })
    try {
      await get().fetchPanelMessages(instructionId)
      const tempMessageId = `temp-${Date.now()}`

      set((state) => ({
        currentPanelMessages: [
          ...state.currentPanelMessages,
          {
            id: 'loading',
            chat_id: instructionId,
            markdown: 'Loading thinking process...',
            sending_agent: 'planning_agent',
            response_index: 0,
            timestamp: new Date().toISOString(),
            render_type: 'LOADING',
            streaming: true,
          },
        ],
      }))

      const response = await fetch(
        `${API_URL}/api/v3/orgs/${getAccount()}/messages/`,
        {
          method: 'POST',
          body: JSON.stringify({
            message_text: null,
            chat_id: instructionId,
          }),
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
          signal: controller.signal,
        },
      )
      if (response.status === 201 || response.status === 409) {
        await get().handleStreamingResponse(response, tempMessageId)
      } else {
        get().removePanelLoadingMessage(instructionId)
      }
    } catch (error) {
      console.error('Failed to fetch instruction thinking:', error)
      get().removePanelLoadingMessage(instructionId)
    }
  },
  sendFeedbackMessage: async (message: string) => {
    const { feedbackChatId } = get()
    if (!feedbackChatId) return
    get().setInputState(feedbackChatId, 'loading')
    const tempMessageId = `temp-${Date.now()}`
    get().addFeedbackMessage({
      id: tempMessageId,
      chat_id: feedbackChatId,
      markdown: message,
      sending_agent: 'user',
      response_index: 0,
      timestamp: new Date().toISOString(),
      render_type: RenderType.STANDARD,
    })
    get().addFeedbackMessage({
      id: 'loading',
      chat_id: feedbackChatId,
      markdown: 'Getting response',
      sending_agent: 'planning_agent',
      response_index: 0,
      timestamp: new Date().toISOString(),
      render_type: 'LOADING',
      streaming: true,
    })
    try {
      const response = await fetch(
        `${API_URL}/api/v3/orgs/${getAccount()}/messages/`,
        {
          method: 'POST',
          body: JSON.stringify({
            message_text: message,
            chat_id: feedbackChatId,
          }),
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
        },
      )
      await get().handleStreamingResponse(response, tempMessageId)
    } catch (error) {
      console.error('Failed to send feedback message:', error)
      get().removePanelLoadingMessage(feedbackChatId)
      get().setInputState(feedbackChatId, 'send')
    }
  },
  handleStreamEnd: () => {
    const { feedbackChatId } = get()
    if (feedbackChatId) {
      get().setInputState(feedbackChatId, 'send')
    }
    set((state) => ({
      currentPanelMessages: state.currentPanelMessages
        .filter((msg) => msg.render_type !== RenderType.TEMPORARY)
        .map((message) => ({
          ...message,
          streaming: false,
        })),
    }))
  },
  updateAdminFeedback: (userMessageId: string, isPositive?: boolean | null) => {
    set((state) => ({
      currentPanelMessages: state.currentPanelMessages.map((msg) => {
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
  setActiveInstructionId: (id) => set({ activeInstructionId: id }),
  setActiveinstructionName: (name) => set({ activeinstructionName: name }),
}))

export const getFeedbackContent = () => {
  const editor = usePanelChatStore.getState().feedbackEditor
  const stringifiedEditorState = JSON.stringify(
    editor?.getEditorState().toJSON(),
  )
  const parsedEditorState = editor?.parseEditorState(stringifiedEditorState)

  const editorStateTextString = parsedEditorState?.read(() =>
    $getRoot().getTextContent(),
  )

  return editorStateTextString ?? ''
}

export const clearFeedbackContent = () => {
  const editor = usePanelChatStore.getState().feedbackEditor
  editor?.update(() => {
    const root = $getRoot()
    root.clear()
  })
}

export const isFeedbackContentEmpty = () => {
  const content = getFeedbackContent()?.trim()
  return content?.length === 0
}
