import { ReactComponent as AiChatIcon } from 'lib/icons/ai-chat.svg'
import { ChatMessage } from 'lib/models/message'
import ChatMessageWidget from './ChatMessage'
import { useEffect, useState } from 'react'
import ProgressMessages from './ProgressMessages'
import { TooltipButton } from 'components/Button'
import { Copy, Link, Link2 } from 'lucide-react'
import removeMarkdown from 'markdown-to-text'
import { toast } from 'sonner'
import { APP_URL } from 'lib/constants'
import { getAccount } from 'lib/stores/user'
import { useChatStore } from 'lib/stores/chat'

interface MessageGroupProps {
  messages: ChatMessage[]
  sender: 'user' | 'ai'
  streaming?: boolean
}

const MessageGroup: React.FC<MessageGroupProps> = ({
  messages,
  sender,
  streaming,
}) => {
  const [progressMessages, setProgressMessages] = useState<ChatMessage[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  useEffect(() => {
    const progressMessages = messages.filter(
      (message) =>
        message.render_type === 'TEMPORARY' ||
        message.render_type === 'LOADING',
    )
    const chatMessages = messages.filter(
      (message) =>
        message.render_type !== 'TEMPORARY' &&
        message.render_type !== 'LOADING',
    )
    setProgressMessages(progressMessages)
    setChatMessages(chatMessages)
  }, [messages])

  const copyToClipboard = () => {
    let message = ''
    for (const chatMessage of chatMessages) {
      message += removeMarkdown(chatMessage.markdown) + '\n'
    }
    navigator.clipboard.writeText(message)
    toast('Message copied to clipboard')
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(
      `${APP_URL}/${getAccount()}/chats/${useChatStore.getState().currentChatId}`,
    )
    toast('Link copied to clipboard')
  }
  return (
    <div
      className={`flex flex-col font-normal md:flex-row ${sender === 'user' ? 'my-8 max-w-[75%] self-end' : 'my-2 w-full max-w-full self-start'} `}
    >
      {sender === 'ai' && (
        <AiChatIcon className='mb-3 mr-6 h-[2rem] w-[2rem] flex-shrink-0' />
      )}
      <div className='flex min-w-0 flex-1 flex-col gap-4'>
        {progressMessages.length > 0 && (
          <ProgressMessages messages={progressMessages} />
        )}
        {chatMessages.map((message, index) => {
          return (
            <ChatMessageWidget
              message={message}
              key={`${message.chat_id}-${message.id}-${message.response_index}`}
              groupIndex={index}
            />
          )
        })}
        {sender === 'ai' && !streaming && (
          <div className='mt-2 flex gap-2'>
            <TooltipButton
              tooltip='Copy'
              variant='ghost'
              size='icon'
              onClick={copyToClipboard}
            >
              <Copy />
            </TooltipButton>
            <TooltipButton
              tooltip='Copy Link'
              variant='ghost'
              size='icon'
              onClick={copyLinkToClipboard}
            >
              <Link2 />
            </TooltipButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageGroup
