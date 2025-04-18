import copy from 'copy-to-clipboard'
import {
  Check,
  CheckCircle,
  CircleCheckBig,
  CircleDashed,
  Copy,
  Link2,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import removeMarkdown from 'markdown-to-text'
import { useId } from 'react'
import { toast } from 'sonner'

import {
  useAdminFeedbackClone,
  useCheckFeedbackChatHasAdminFeedback,
  useUpdateMessageAdminFeedback,
  useUpdateMessageFeedback,
} from '@ns/public-api'
import { cn } from '@ns/ui/utils/cn'

import { TooltipButton } from 'components/Button'
import { Label } from 'components/Label'
import { Spinner } from 'components/Spinner'
import { Switch } from 'components/Switch'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { APP_URL } from 'lib/constants'
import { type ChatMessage } from 'lib/models/message'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount, useUserStore } from 'lib/stores/user'

import { useMessage } from './MessageContext'

type BaseMessageTooltipsProps = {
  chatMessages: ChatMessage[]
  userMessage?: ChatMessage
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
  const { isFeedbackChat } = useUserStore()
  return (
    <div className={cn('flex items-center justify-end', className)}>
      <UserMessageTooltips
        chatMessages={chatMessages}
        userMessage={userMessage}
      />
      {!isPopoverFeedbackChat &&
        (userMessage?.is_last_user_message_for_feedback_chat ||
          !isFeedbackChat) && (
          <FeedbackButtons
            chatMessages={chatMessages}
            userMessage={userMessage}
            isPopoverFeedbackChat={isPopoverFeedbackChat}
          />
        )}
    </div>
  )
}

export function SensitiveSwitch() {
  const id = useId()
  const { updateChatMessage, updateAdminFeedback } = useChatStore()
  const { updateFeedbackMessage, updateAdminFeedback: up } = usePanelChatStore()
  const { message } = useMessage()
  const { mutate, variables } = useUpdateMessageAdminFeedback({
    mutation: {
      onSuccess: (message) => {
        updateChatMessage(message.id, message.response_index ?? 0, message)
        updateFeedbackMessage(message.id, message.response_index ?? 0, message)
        updateAdminFeedback(message.id, message.is_positive_admin_feedback)
        up(message.id, message.is_positive_admin_feedback)
      },
    },
  })
  return (
    <div className='flex items-center gap-1'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Switch
            id={id}
            checked={
              message.is_dm_sensitive
                ? true
                : (variables?.data?.is_user_sensitive ??
                  message.is_user_sensitive ??
                  false)
            }
            disabled={message.is_dm_sensitive ?? false}
            onCheckedChange={(is_user_sensitive) =>
              mutate({
                accountName: getAccount(),
                messageId: message.id,
                data: {
                  is_user_sensitive,
                  is_positive_admin_feedback:
                    message.is_positive_admin_feedback,
                },
              })
            }
          />
        </TooltipTrigger>
        {message.is_dm_sensitive && (
          <TooltipContent>
            This message uses sensitive items. To change the sensitivity, edit
            or remove those items.
          </TooltipContent>
        )}
      </Tooltip>
      <Label className='text-xs' htmlFor={id}>
        Sensitive
      </Label>
    </div>
  )
}

export function UserMessageTooltips({
  chatMessages,
  userMessage,
  className,
}: BaseMessageTooltipsProps) {
  const { isFeedbackChat } = useUserStore()
  const { feedbackChatId } = usePanelChatStore()
  const {
    state: { showCopyLinkButton, showCopyIdButton },
  } = useCustomizationStore()

  const copyToClipboard = () => {
    let message = ''
    for (const chatMessage of chatMessages) {
      message += `${removeMarkdown(chatMessage.markdown ?? '')}\n`
    }
    if (copy(message)) {
      toast('Message copied to clipboard')
    } else {
      toast('Failed to copy to clipboard')
    }
  }

  const copyLinkToClipboard = () => {
    const { currentChat } = useChatStore.getState()
    if (!currentChat) return
    const messageId = chatMessages[chatMessages.length - 1].id
    const chatId = feedbackChatId || currentChat.id
    const path =
      feedbackChatId || isFeedbackChat ? 'monitor/feedback' : 'widget'
    const link = `${APP_URL}/${getAccount()}/${path}/${chatId}#${messageId}`
    if (copy(link)) {
      toast('Link copied to clipboard')
    } else {
      toast('Failed to copy to clipboard')
    }
  }

  const copyIdToClipboard = () => {
    const { currentChat } = useChatStore.getState()
    if (!currentChat) return
    const messageId = chatMessages[chatMessages.length - 1].id
    const chatId = feedbackChatId || currentChat.id
    const id = `${getAccount()}#${chatId}#${messageId}`
    if (copy(id)) {
      toast('Reference ID copied to clipboard')
    } else {
      toast('Failed to copy to clipboard')
    }
  }

  const isViewingFeedbackInChat = userMessage?.feedback_chat_id
    ? userMessage.feedback_chat_id === feedbackChatId
    : undefined

  return (
    <div className={cn('flex', className)}>
      <TooltipButton
        tooltip='Copy'
        variant='ghost'
        size='icon'
        onClick={copyToClipboard}
        disabled={isViewingFeedbackInChat}
      >
        <Copy />
      </TooltipButton>
      {showCopyLinkButton && (
        <TooltipButton
          tooltip='Copy link'
          variant='ghost'
          size='icon'
          onClick={copyLinkToClipboard}
          disabled={isViewingFeedbackInChat}
        >
          <Link2 />
        </TooltipButton>
      )}
      {showCopyIdButton && (
        <TooltipButton
          tooltip='Copy reference ID'
          variant='ghost'
          size='icon'
          onClick={copyIdToClipboard}
          disabled={isViewingFeedbackInChat}
        >
          <Share2 />
        </TooltipButton>
      )}
    </div>
  )
}

export function FeedbackButtons({
  userMessage,
  className,
  isPopoverFeedbackChat,
}: BaseMessageTooltipsProps) {
  const { isFeedbackChat } = useUserStore()
  const { isReadOnlyChat } = useChatStore()
  const { rightPanelOpen } = useLayoutStore()
  const { data, variables, mutate } = useUpdateMessageFeedback()
  const message = data ?? userMessage
  const isPositiveFeedback = variables
    ? variables.data.is_positive_feedback
    : message?.is_positive_feedback
  const handleFeedback = (newFeedback: boolean) => {
    if (isPositiveFeedback === newFeedback) {
      mutate({
        accountName: getAccount(),
        messageId: userMessage?.id as string,
        data: { is_positive_feedback: null },
      })
    } else {
      mutate({
        accountName: getAccount(),
        messageId: userMessage?.id as string,
        data: { is_positive_feedback: newFeedback },
      })
    }
  }
  return (
    <div className={cn('flex items-center', className)}>
      <>
        <TooltipButton
          tooltip='Good response'
          variant='ghost'
          size='icon'
          onClick={() => handleFeedback(true)}
          disabled={
            isFeedbackChat ||
            isReadOnlyChat ||
            isPopoverFeedbackChat ||
            rightPanelOpen
          }
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
          disabled={
            isFeedbackChat ||
            isReadOnlyChat ||
            isPopoverFeedbackChat ||
            rightPanelOpen
          }
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

export function SaveAdminFeedbackButton() {
  const { updateChatMessage, updateAdminFeedback } = useChatStore()
  const { updateFeedbackMessage, updateAdminFeedback: up } = usePanelChatStore()
  const { message } = useMessage()
  const { mutate, isPending } = useUpdateMessageAdminFeedback({
    mutation: {
      onSuccess: (message) => {
        updateFeedbackMessage(message.id, message.response_index ?? 0, message)
        updateAdminFeedback(message.id, message.is_positive_admin_feedback)
        up(message.id, message.is_positive_admin_feedback)
        toast(
          message.is_positive_admin_feedback
            ? 'Feedback saved'
            : 'Feedback removed',
        )
      },
      onError: () => {
        toast.error('Failed to update feedback. Please try again.')
      },
    },
  })
  return message.is_positive_admin_feedback ? (
    <TooltipButton
      variant='outline'
      size='sm'
      onClick={() =>
        mutate({
          accountName: getAccount(),
          messageId: message.id,
          data: { is_positive_admin_feedback: false },
        })
      }
      className={cn(
        'group/feedback relative h-8 text-green-600 transition-all duration-300 ease-in-out hover:pr-[68px] hover:text-green-600',
        isPending && 'cursor-wait',
      )}
    >
      {isPending ? (
        <Spinner size={0.4} />
      ) : (
        <CircleCheckBig className='h-4 w-4' />
      )}
      <div className='pointer-events-none absolute translate-x-10 text-xs opacity-0 group-hover/feedback:pointer-events-auto group-hover/feedback:opacity-100 group-hover/feedback:delay-150'>
        Feedback
      </div>
    </TooltipButton>
  ) : (
    <TooltipButton
      variant='outline'
      size='sm'
      onClick={() =>
        mutate({
          accountName: getAccount(),
          messageId: message.id,
          data: { is_positive_admin_feedback: true },
        })
      }
      tooltip='Save feedback'
      className={cn('h-8', isPending && 'cursor-wait')}
    >
      {isPending ? <Spinner size={0.4} /> : <Check className='h-4 w-4' />}
      Save feedback
    </TooltipButton>
  )
}

export function OpenFeedbackChatButton() {
  const { toggleRightPanel } = useLayoutStore()
  const { feedbackChatId, setFeedbackChatId, setLoadingPanelMessages } =
    usePanelChatStore()
  const { message } = useMessage()
  const { data: hasAdminFeedback = false } =
    useCheckFeedbackChatHasAdminFeedback(
      {
        accountName: getAccount(),
        chatId: message.feedback_chat_id as string,
      },
      {
        query: {
          enabled: message.feedback_chat_id != null,
          refetchInterval: 3000,
        },
      },
    )
  const { mutate: cloneChatMutation } = useAdminFeedbackClone({
    mutation: {
      onSuccess: (data) => {
        setFeedbackChatId(data.id)
        message.feedback_chat_id = data.id
        if (!message.feedback_chat_id) {
          toast('Chat cloned for feedback')
        }
      },
      onError: () => {
        toast.error('Failed to clone chat. Please try again.')
      },
    },
  })

  const onClick = () => {
    if (feedbackChatId) {
      setFeedbackChatId(null)
      toggleRightPanel()
    } else {
      if (message.feedback_chat_id == null) {
        setLoadingPanelMessages(true)
        cloneChatMutation({
          accountName: getAccount(),
          messageId: message.id,
        })
      } else {
        setFeedbackChatId(message.feedback_chat_id)
      }
      toggleRightPanel()
    }
  }
  return (
    <>
      <TooltipButton
        variant='outline'
        size='sm'
        className='h-8'
        onClick={onClick}
        tooltip='Open feedback chat'
      >
        {hasAdminFeedback ? (
          <CheckCircle className='h-4 w-4 text-green-600' />
        ) : (
          message.feedback_chat_id && <CircleDashed className='h-4 w-4' />
        )}
        Feedback
      </TooltipButton>
    </>
  )
}
