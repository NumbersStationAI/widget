import { ReactComponent as AiChatIcon } from 'lib/icons/ai-chat.svg'
import { ChatMessage } from 'lib/models/message'
import { cn } from 'lib/utils'
import { getMessageKey } from 'lib/utils/message'
import { useMemo } from 'react'
import ChatMessageWidget from './ChatMessage'
import { MessageTooltips } from './MessageTooltips'
import ProgressMessages from './ProgressMessages'

interface MessageGroupProps {
  messages: ChatMessage[]
  sender: 'user' | 'system'
  isStreaming?: boolean
  showCopyActions?: boolean
  userMessage: ChatMessage
  isPopoverFeedbackChat?: boolean
}

export default function MessageGroup({
  messages,
  sender,
  isStreaming,
  userMessage,
  showCopyActions = true,
  isPopoverFeedbackChat = false,
}: MessageGroupProps) {
  const progressMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.render_type === 'TEMPORARY' ||
          message.render_type === 'LOADING',
      ),
    [messages],
  )

  const chatMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.render_type !== 'TEMPORARY' &&
          message.render_type !== 'LOADING' &&
          message.sending_agent !== 'query_explanation_agent',
      ),
    [messages],
  )

  return (
    <div
      className={cn(
        'flex flex-col font-normal',
        !isPopoverFeedbackChat && 'md:flex-row',
        sender === 'user'
          ? 'max-w-[75%] self-end'
          : 'w-full max-w-full self-start',
        sender === 'user'
          ? (isPopoverFeedbackChat ? 'my-2' : 'my-8')
          : 'my-2'
      )}
    >
      {sender === 'system' && (
        <AiChatIcon className='mb-3 mr-6 h-[2rem] w-[2rem] flex-shrink-0' />
      )}
      <div className='flex min-w-0 flex-1 flex-col gap-4'>
        {progressMessages.length > 0 && (
          <ProgressMessages messages={progressMessages} />
        )}
        {chatMessages.map((message, index) => (
          <ChatMessageWidget
            message={message}
            key={getMessageKey(message.id, message.response_index)}
            groupIndex={index}
            isPopoverFeedbackChat={isPopoverFeedbackChat}
          />
        ))}
        {sender === 'system' && !isStreaming && showCopyActions && (
          <MessageTooltips
            chatMessages={chatMessages}
            userMessage={userMessage}
            isPopoverFeedbackChat={isPopoverFeedbackChat}
            className='flex'
          />
        )}
      </div>
    </div>
  )
}
