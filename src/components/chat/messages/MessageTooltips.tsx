import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, AlertDescription } from 'components/Alert'
import { Button, TooltipButton } from 'components/Button'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from 'components/Popover'
import { Separator } from 'components/Separator'
import copy from 'copy-to-clipboard'
import { API_URL, APP_URL } from 'lib/constants'
import { ChatMessage } from 'lib/models/message'
import { QUERY_KEYS } from 'lib/queryKeys'
import { useChatStore } from 'lib/stores/chat'
import { useFeedbackStore } from 'lib/stores/feedback'
import { useLayoutStore } from 'lib/stores/layout'
import { getAccount, useUserStore } from 'lib/stores/user'
import { cn } from 'lib/utils'
import { getAuthHeaders } from 'lib/utils/token'
import {
  Check,
  CheckCircle,
  CircleCheckBig,
  CircleDashed,
  Copy,
  ExternalLink,
  InfoIcon,
  Link2,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import removeMarkdown from 'markdown-to-text'
import { useState } from 'react'
import { toast } from 'sonner'
import { FeedbackView } from '../feedback/FeedbackView'

type BaseMessageTooltipsProps = {
  chatMessages: ChatMessage[]
  userMessage: ChatMessage
  isLastUserMessageForFeedbackChat?: boolean
  className?: string
  isPopoverFeedbackChat?: boolean
}

export function MessageTooltips({
  chatMessages,
  userMessage,
  className,
  isPopoverFeedbackChat,
}: BaseMessageTooltipsProps) {
  const { user } = useUserStore()
  const { isFeedbackChat } = useUserStore()
  const { isReadOnlyChat } = useChatStore()
  const isSQLMessage = chatMessages.some(
    (message) => message.message_table_id != null,
  )
  const isLastUserMessageForFeedbackChat = chatMessages.some(
    (message) => message.is_last_user_message_for_feedback_chat,
  )

  return (
    <div className='flex-col'>
      <div className='flex items-center gap-1'>
        <UserMessageTooltips
          chatMessages={chatMessages}
          userMessage={userMessage}
        />
        {!isPopoverFeedbackChat && (isLastUserMessageForFeedbackChat || !isFeedbackChat) && (
          <FeedbackButtons
            chatMessages={chatMessages}
            userMessage={userMessage}
            isPopoverFeedbackChat={isPopoverFeedbackChat}
          />
        )}
        {isSQLMessage && <div className='h-6 w-px bg-neutral-200' />}
        {user?.role === 'ADMIN' && isSQLMessage && (
          <div className='flex items-center pl-1'>
            {isFeedbackChat || isPopoverFeedbackChat ? (
              <SaveAdminFeedbackButton
                chatMessages={chatMessages}
                userMessage={userMessage}
              />
            ) : (
              <OpenFeedbackChatButton
                chatMessages={chatMessages}
                userMessage={userMessage}
              />
            )}
          </div>
        )}
      </div>
      {isLastUserMessageForFeedbackChat &&
        (isFeedbackChat || isPopoverFeedbackChat) && (
          <div className='mt-4 flex-col'>
            <div className='flex w-full items-center justify-center gap-2'>
              <Separator
                className={cn(isPopoverFeedbackChat ? 'w-1/5' : 'w-1/2')}
              />
              <div className={cn('text-nowrap text-neutral-400', isPopoverFeedbackChat && 'text-xs')}>
                End of user's message
              </div>
              <Separator
                className={cn(isPopoverFeedbackChat ? 'w-1/5' : 'w-1/2')}
              />
            </div>
            <Alert className='mt-8 flex border border-neutral-200 bg-neutral-100'>
              <InfoIcon className='mr-1 h-4 w-4' />
              <AlertDescription className={cn(isPopoverFeedbackChat && 'text-xs')}>
                Please continue in the chat to provide corrections to the
                negative feedback. Click 'Save as Feedback' once satisfied with
                the correct answer:
              </AlertDescription>
            </Alert>
          </div>
        )}
    </div>
  )
}

export function UserMessageTooltips({
  chatMessages,
  userMessage,
  className,
}: BaseMessageTooltipsProps) {
  function copyToClipboard() {
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

  function copyLinkToClipboard() {
    const currentChat = useChatStore.getState().currentChat
    if (!currentChat) return
    const messageId = chatMessages[chatMessages.length - 1].id
    const link = `${APP_URL}/${getAccount()}/widget/${currentChat.id}#${messageId}`

    if (copy(link)) {
      toast('Link copied to clipboard')
    } else {
      toast('Failed to copy to clipboard')
    }
  }

  return (
    <div className={cn('flex gap-1', className)}>
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
  )
}

export function FeedbackButtons({
  chatMessages,
  userMessage,
  className,
  isPopoverFeedbackChat,
}: BaseMessageTooltipsProps) {
  const { isFeedbackChat } = useUserStore()
  const { isReadOnlyChat } = useChatStore()
  const { data, variables, mutate } = useMutation({
    mutationFn: async (feedback: boolean | null) => {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/messages/${userMessage?.id}/feedback`,
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
      if (!response.ok) throw new Error('Failed to update feedback')
      return (await response.json()) as ChatMessage
    },
  })
  const message = data ?? userMessage
  const isPositiveFeedback = variables ?? message?.is_positive_feedback
  const handleFeedback = (newFeedback: boolean) => {
    if (isPositiveFeedback === newFeedback) {
      mutate(null)
    } else {
      mutate(newFeedback)
    }
  }
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <>
        <TooltipButton
          tooltip='Good response'
          variant='ghost'
          size='icon'
          onClick={() => handleFeedback(true)}
          disabled={isFeedbackChat || isReadOnlyChat || isPopoverFeedbackChat}
        >
          <ThumbsUp
            className={cn(
              isPositiveFeedback && 'fill-black',
              isFeedbackChat && 'opacity-90',
            )}
          />
        </TooltipButton>
        <TooltipButton
          tooltip='Bad response'
          variant='ghost'
          size='icon'
          onClick={() => handleFeedback(false)}
          disabled={isFeedbackChat || isReadOnlyChat || isPopoverFeedbackChat}
        >
          <ThumbsDown
            className={cn(
              isPositiveFeedback === false && 'fill-black',
              isFeedbackChat && 'opacity-90',
            )}
          />
        </TooltipButton>
      </>
    </div>
  )
}

function SaveAdminFeedbackButton({
  userMessage,
  chatMessages,
}: BaseMessageTooltipsProps) {
  const queryClient = useQueryClient()
  const { variables, data, mutate } = useMutation({
    mutationFn: async (isPositive: boolean | null) => {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/messages/${userMessage?.id}/admin_feedback`,
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
      if (!response.ok) throw new Error('Failed to update feedback')
      return (await response.json()) as ChatMessage
    },
    onSuccess: (_, isPositive) => {
      toast(isPositive ? 'Feedback saved' : 'Feedback removed')
      if (userMessage) {
        const feedbackChatId =
          userMessage.feedback_chat_id ??
          chatMessages?.find((msg) => msg.feedback_chat_id)?.feedback_chat_id
        userMessage.is_positive_admin_feedback =
          isPositive === null ? undefined : isPositive
        if (feedbackChatId) {
          queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.ADMIN_FEEDBACK, feedbackChatId],
          })
        }
      }
    },
    onError: () => {
      toast.error('Failed to update feedback. Please try again.')
    },
  })

  const message = data ?? userMessage
  const isPositiveAdminFeedback =
    variables ?? message?.is_positive_admin_feedback

  if (isPositiveAdminFeedback) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => mutate(null)}
        className='h-8 text-green-600 hover:text-green-600'
      >
        <CircleCheckBig className='mr-2 h-4 w-4' />
        Feedback
      </Button>
    )
  }
  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => mutate(true)}
      className='h-8'
    >
      <Check className='mr-2 h-4 w-4' />
      Save as feedback
    </Button>
  )
}

export function OpenFeedbackChatButton({
  userMessage,
}: BaseMessageTooltipsProps) {
  const { toggleRightPanel } = useLayoutStore()
  const [isOpen, setIsOpen] = useState(false)
  const { feedbackChatId, setFeedbackChatId } = useFeedbackStore()
  const { data: hasAdminFeedback = false } = useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_FEEDBACK, userMessage?.feedback_chat_id],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/chat/${userMessage.feedback_chat_id}/has_admin_feedback`,
        {
          credentials: 'include',
          headers: {
            ...getAuthHeaders(),
          },
        },
      )
      if (!response.ok) return false
      return response.json()
    },
    enabled: !!userMessage?.feedback_chat_id,
    refetchInterval: 3000,
  })
  const { mutate: cloneChatMutation } = useMutation({
    mutationFn: async () => {
      if (userMessage.feedback_chat_id) {
        return { id: userMessage.feedback_chat_id }
      }
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/messages/${userMessage.id}/admin_feedback_clone`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        },
      )
      if (!response.ok) throw new Error('Failed to clone chat')
      return await response.json()
    },
    onSuccess: (data) => {
      setFeedbackChatId(data.id)
      if (!userMessage.feedback_chat_id) {
        toast('Chat cloned for feedback')
      }
    },
    onError: () => {
      toast.error('Failed to clone chat. Please try again.')
    },
  })
  const handleNavigateToFeedback = () => {
    window.parent.postMessage(
      {
        type: 'NAVIGATE_TO_FEEDBACK',
        path: `/${getAccount()}/monitor/feedback/${feedbackChatId}`,
        params: {
          originalChatId: userMessage.id,
        },
      },
      '*',
    )
  }
  const handleFeedbackClick = () => {
    cloneChatMutation()
    toggleRightPanel()
  }
  const buttonText = userMessage.feedback_chat_id
    ? 'Show feedback chat'
    : 'Start feedback chat'
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='h-8'
            onClick={handleFeedbackClick}
          >
            {buttonText}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side='right'
          align='end'
          sideOffset={500}
          className='h-[60vh] w-[50vh] p-0'
          avoidCollisions={true}
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <div className='flex h-full flex-col'>
            <div className='absolute top-2 z-10 w-full px-2'>
              <div className='flex items-center justify-between'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8'
                  onClick={handleNavigateToFeedback}
                >
                  <ExternalLink className='h-4 w-4' />
                </Button>
                <PopoverClose asChild>
                  <Button
                    variant='ghost'
                    className='h-6 w-6 rounded-full p-0'
                    aria-label='Close'
                    onClick={() => toggleRightPanel()}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </PopoverClose>
              </div>
            </div>
            <FeedbackView />
          </div>
        </PopoverContent>
      </Popover>
      {hasAdminFeedback ? (
        <CheckCircle className='mx-2 h-4 w-4 text-green-600' />
      ) : (
        <CircleDashed className='mx-2 h-4 w-4' />
      )}
    </>
  )
}
