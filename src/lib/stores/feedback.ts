import { $getRoot, LexicalEditor } from 'lexical'
import { API_URL } from 'lib/constants'
import { ChatMessage } from 'lib/models/message'
import { checkResponseError } from 'lib/utils/fetch'
import { isMessageEmpty } from 'lib/utils/message'
import { replaceAll } from 'lib/utils/string'
import { getAuthHeaders } from 'lib/utils/token'
import { create } from 'zustand'
import { InputState } from './chat'
import { getAccount } from './user'

interface FeedbackState {
    feedbackChatId: string | null
    currentFeedbackMessages: ChatMessage[]
    loadingFeedbackMessages: boolean
    feedbackEditor: LexicalEditor | null
    inputState: Map<string, InputState>
    setFeedbackEditor: (editor: LexicalEditor) => void
    setFeedbackChatId: (id: string | null) => void
    setCurrentFeedbackMessages: (messages: ChatMessage[]) => void
    setLoadingFeedbackMessages: (loading: boolean) => void
    fetchFeedbackMessages: () => Promise<void>
    sendFeedbackMessage: (content: string) => Promise<void>
    addFeedbackMessage: (message: ChatMessage) => void
    updateFeedbackMessage: (id: string, responseIndex: number, message: ChatMessage) => void
    setInputState: (id: string, state: InputState) => void
    handleStreamingResponse: (response: Response, tempMessageId: string) => Promise<void>
    handleStreamEnd: () => void
    updateDisabledState: (id: string) => void
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
    feedbackChatId: null,
    loadingFeedbackMessages: false,
    feedbackEditor: null,
    currentFeedbackMessages: [],
    setFeedbackEditor: (editor) => set({ feedbackEditor: editor }),
    setCurrentFeedbackMessages: (messages) => set({
        currentFeedbackMessages: messages.filter(
            message => !isMessageEmpty(message)
        ).reverse()
    }),
    setFeedbackChatId: (id) => {
        set({ feedbackChatId: id })
        if (id) {
            get().fetchFeedbackMessages()
        }
    },
    setLoadingFeedbackMessages: (loading) => set({ loadingFeedbackMessages: loading }),
    fetchFeedbackMessages: async () => {
        const { feedbackChatId } = get()
        if (!feedbackChatId) {
            set({ currentFeedbackMessages: [] })
            return
        }
        set({ loadingFeedbackMessages: true })
        try {
            const response = await fetch(
                `${API_URL}/v3/orgs/${getAccount()}/chat/${feedbackChatId}/messages?limit=1000`,
                {
                    credentials: 'include',
                    headers: getAuthHeaders(),
                }
            )
            checkResponseError(response)
            const data = await response.json()
            get().setCurrentFeedbackMessages(data.data)
        } catch (e) {
            console.error('Failed to fetch feedback messages:', e)
        }
        set({ loadingFeedbackMessages: false })
    },
    addFeedbackMessage: (message) => {
        set(state => ({
            currentFeedbackMessages: [...state.currentFeedbackMessages, message]
        }))
    },
    updateFeedbackMessage: (id: string, responseIndex: number, message: ChatMessage) => {
        set((state) => {
            if (!isMessageEmpty(message)) {
                const index = state.currentFeedbackMessages.findIndex(
                    (msg) => msg.id === id && msg.response_index === responseIndex
                )
                if (index < 0) {
                    state.currentFeedbackMessages.push(message)
                } else {
                    state.currentFeedbackMessages[index] = message
                }
            }
            return { currentFeedbackMessages: [...state.currentFeedbackMessages] }
        })
    },
    inputState: new Map<string, InputState>([['', 'disabled']]),
    setInputState: (id, state) => {
        const inputState = get().inputState
        inputState.set(id, state)
        set({ inputState })
    },
    updateDisabledState: (id: string) => {
        const inputState = get().inputState.get(id)
        if (isFeedbackContentEmpty()) {
            if (inputState === 'send') {
                get().setInputState(id, 'disabled')
            }
        } else {
            if (inputState === 'disabled') {
                get().setInputState(id, 'send')
            }
        }
    },
    handleStreamingResponse: async (response: Response, tempMessageId: string) => {
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
            let chunk = decoder.decode(value, { stream: true })
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
                    if (message.sending_agent !== 'user') {
                        if (!isMessageEmpty(message)) {
                            set(state => ({
                                currentFeedbackMessages: state.currentFeedbackMessages.filter(
                                    msg => msg.render_type !== 'LOADING'
                                )
                            }))
                        }
                        message.streaming = true
                        get().updateFeedbackMessage(
                            message.id ?? '',
                            message.response_index,
                            message
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
            render_type: 'STANDARD',
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
                `${API_URL}/v3/orgs/${getAccount()}/messages/`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        message_text: message,
                        chat_id: feedbackChatId
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders(),
                    },
                    credentials: 'include',
                }
            )
            await get().handleStreamingResponse(response, tempMessageId)
        } catch (error) {
            console.error('Failed to send feedback message:', error)
            set(state => ({
                currentFeedbackMessages: state.currentFeedbackMessages.filter(
                    msg => msg.id !== tempMessageId && msg.render_type !== 'LOADING'
                )
            }))
            get().setInputState(feedbackChatId, 'send')
        }
    },
    handleStreamEnd: () => {
        const { feedbackChatId } = get()
        if (feedbackChatId) {
            get().setInputState(feedbackChatId, 'send')
        }
        set(state => ({
            currentFeedbackMessages: state.currentFeedbackMessages
                .filter(msg => msg.render_type !== 'TEMPORARY')
                .map(message => ({
                    ...message,
                    streaming: false
                }))
        }))
    }
}))

export const getFeedbackContent = () => {
    const editor = useFeedbackStore.getState().feedbackEditor
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
    const editor = useFeedbackStore.getState().feedbackEditor
    editor?.update(() => {
        const root = $getRoot()
        root.clear()
    })
}

export const isFeedbackContentEmpty = () => {
    const content = getFeedbackContent()?.trim()
    return content?.length === 0
}
