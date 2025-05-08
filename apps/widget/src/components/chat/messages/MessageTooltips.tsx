import copy from 'copy-to-clipboard'
import { Copy, Link2, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import removeMarkdown from 'markdown-to-text'
import { toast } from 'sonner'

import { useUpdateMessageFeedback } from '@ns/public-api'
import { TooltipButton } from '@ns/ui/atoms/Button'
import { cn } from '@ns/ui/utils/cn'

import { APP_URL } from 'lib/constants'
import { type ChatMessage } from 'lib/models/message'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount, useUserStore } from 'lib/stores/user'

type TooltipsProps = {
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
}: TooltipsProps) {
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

export function UserMessageTooltips({
  chatMessages,
  userMessage,
  className,
}: TooltipsProps) {
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
}: TooltipsProps) {
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
