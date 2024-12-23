import { ReactComponent as AiChatIcon } from 'lib/icons/ai-chat.svg'
import { ChatMessage } from 'lib/models/message'
import ChatMessageWidget from './ChatMessage'
import { useEffect, useState } from 'react'
import ProgressMessages from './ProgressMessages'
import { Button, TooltipButton } from 'components/Button'
import {
  Copy,
  Link2,
  ThumbsDown,
  ThumbsUp,
  CircleCheckBig,
  Check,
} from 'lucide-react'
import removeMarkdown from 'markdown-to-text'
import { toast } from 'sonner'
import { APP_URL, API_URL } from 'lib/constants'
import { getAccount, useUserStore } from 'lib/stores/user'
import { useChatStore } from 'lib/stores/chat'
import copy from 'copy-to-clipboard'
import { getAuthHeaders } from 'lib/utils/token'

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
  const [isPositiveAdminFeedback, setIsPositiveAdminFeedback] = useState<
    boolean | null
  >(userMessage?.is_positive_admin_feedback ?? null)
  const { user, showAdminFeedbackButton } = useUserStore()
  const currentAccount = getAccount()

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
    if (copy(message)) {
      toast('Message copied to clipboard')
    } else {
      toast('Failed to copy to clipboard')
    }
  }

  const copyLinkToClipboard = () => {
    const link = `${APP_URL}/${getAccount()}/widget/${useChatStore.getState().currentChatId}#${messages[messages.length - 1].id}`
    if (copy(link)) {
      toast('Link copied to clipboard')
    } else {
      toast('Failed to copy to clipboard')
    }
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
            ...getAuthHeaders(),
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

  const setAdminFeedback = (isPositive: true | null) => {
    if (!userMessage) return
    setIsPositiveAdminFeedback(isPositive)
    try {
      fetch(
        `${API_URL}/v3/orgs/${getAccount()}/messages/${userMessage.id}/admin_feedback`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ is_positive_admin_feedback: isPositive }),
        },
      )
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setIsPositiveFeedback(userMessage?.is_positive_feedback ?? null)
    setIsPositiveAdminFeedback(userMessage?.is_positive_admin_feedback ?? null)
  }, [
    userMessage?.is_positive_feedback,
    userMessage?.is_positive_admin_feedback,
  ])

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
              key={`${message.id}-${message.response_index}`}
              groupIndex={index}
            />
          )
        })}
        {sender === 'ai' && !streaming && showCopyActions && (
          <div className='mt-2 flex items-center gap-2.5'>
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
                {user?.role === 'ADMIN' && showAdminFeedbackButton && (
                  <>
                    <div className='h-6 w-px bg-neutral-200' />
                    <span className='text-sm font-medium'>Admin</span>
                    {isPositiveAdminFeedback === true ? (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setAdminFeedback(null)}
                        className='h-8 text-green-600'
                      >
                        <CircleCheckBig className='h-4 w-4' />
                        Feedback
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setAdminFeedback(true)}
                        className='h-8'
                      >
                        <Check className='h-4 w-4' />
                        Save as feedback
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageGroup
