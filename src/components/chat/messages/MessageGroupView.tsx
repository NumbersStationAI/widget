import { ReactComponent as AiChatIcon } from 'lib/icons/ai-chat.svg'
import { ChatMessage } from 'lib/models/message'
import ChatMessageWidget from './ChatMessage'
import { useEffect, useState } from 'react'
import ProgressMessages from './ProgressMessages'
import { TooltipButton } from 'components/Button'
import { Copy, Link2, ThumbsDown, ThumbsUp } from 'lucide-react'
import removeMarkdown from 'markdown-to-text'
import { toast } from 'sonner'
import { API_URL, APP_URL } from 'lib/constants'
import { getAccount } from 'lib/stores/user'
import { useChatStore } from 'lib/stores/chat'

interface MessageGroupProps {
  messages: ChatMessage[]
  sender: 'user' | 'ai'
  streaming?: boolean
  showCopyActions?: boolean
  userMessage?: ChatMessage
}

const MessageGroup: React.FC<MessageGroupProps> = ({
  messages,
  sender,
  streaming,
  showCopyActions = true,
  userMessage,
}) => {
  const [progressMessages, setProgressMessages] = useState<ChatMessage[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isPositiveFeedback, setIsPositiveFeedback] = useState<boolean | null>(
    userMessage?.is_positive_feedback ?? null,
  )
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
    console.log('usermessage', userMessage?.id, userMessage?.is_positive_feedback)
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
      `${APP_URL}/${getAccount()}/chats/${useChatStore.getState().currentChatId}#${messages[messages.length - 1].id}`,
    )
    toast('Link copied to clipboard')
  }

  const setFeedback = (isPositive: boolean) => {
    if (!userMessage) return
    const feedback = isPositiveFeedback === isPositive ? null : isPositive
    setIsPositiveFeedback(feedback)

    try {
      fetch(
        `${API_URL}/v3/orgs/${getAccount()}/messages/${userMessage.id}/feedback`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_positive_feedback: feedback,
          }),
        },
      )
    } catch (e: any) {
      console.error(e)
    }
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
        {sender === 'ai' && !streaming && showCopyActions && (
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
            {userMessage && (
              <>
                <TooltipButton
                  tooltip='Good response'
                  variant='ghost'
                  size='icon'
                  onClick={() => setFeedback(true)}
                >
                  <ThumbsUp
                    className={`${isPositiveFeedback === true ? 'fill-black' : ''}`}
                  />
                </TooltipButton>
                <TooltipButton
                  tooltip='Bad response'
                  variant='ghost'
                  size='icon'
                  onClick={() => setFeedback(false)}
                >
                  <ThumbsDown
                    className={`${isPositiveFeedback === false ? 'fill-black' : ''}`}
                  />
                </TooltipButton>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageGroup
