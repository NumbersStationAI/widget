import { createContext, useContext } from 'react'

import { type ChatMessage } from 'lib/models/message'

const MessageContext = createContext<{ message: ChatMessage }>({
  message: {
    id: '',
    chat_id: '',
    sending_agent: '',
    timestamp: '',
  },
})

export const useMessage = () => useContext(MessageContext)

export const MessageContextProvider = MessageContext.Provider
