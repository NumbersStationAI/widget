import { InfoIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { InstructionState, RenderType } from '@ns/public-api'
import { Alert, AlertDescription } from '@ns/ui/atoms/Alert'
import { ProgressMessageCollapsible } from '@ns/ui/molecules/ProgressMessageCollapsible'
import { cn } from '@ns/ui/utils/cn'
import { getMessageKey } from '@ns/ui/utils/getMessageKey'

import { DownloadPDFButton } from 'components/DownloadPDFButton'
import { ExportPDFButton } from 'components/ExportPDFButton'
import { Separator } from 'components/Separator'
import AiChatIcon from 'lib/icons/ai-chat.svg?react'
import { type ChatMessage } from 'lib/models/message'
import { useLayoutStore } from 'lib/stores/layout'
import { getAccount } from 'lib/stores/user'

import { DeepResearchPlan } from './DeepResearchPlan'
import { Message } from './Message'
import { MessageTooltips } from './MessageTooltips'

interface MessageGroupProps {
  messages: ChatMessage[]
  sender: 'user' | 'system'
  isStreaming?: boolean
  showCopyActions?: boolean
  userMessage: ChatMessage
  isPopoverFeedbackChat?: boolean
  className?: string
}

export default function MessageGroupView({
  messages,
  sender,
  isStreaming,
  userMessage,
  showCopyActions = true,
  isPopoverFeedbackChat = false,
  className,
}: MessageGroupProps) {
  const progressMessages = messages.filter(
    (message) =>
      message.render_type === RenderType.TEMPORARY ||
      message.render_type === 'LOADING',
  )
  const thinkingMessages = messages.filter(
    (message) => message.render_type === RenderType.SOFT,
  )
  const chatMessages = useMemo(
    () =>
      messages.filter((message) => message.render_type === RenderType.STANDARD),
    [messages],
  )

  const deepResearchMessage = useMemo(
    () => chatMessages.find((message) => message.deep_research_plan),
    [chatMessages],
  )

  const isResearchInProgress =
    deepResearchMessage?.deep_research_plan?.plan_steps.some((step) =>
      step.instructions?.some(
        (instruction) => instruction.status === InstructionState.in_progress,
      ),
    )

  const [thinkingOpen, setThinkingOpen] = useState(isStreaming)
  useEffect(
    () => setThinkingOpen(!isResearchInProgress && isStreaming),
    [isStreaming, isResearchInProgress],
  )

  const { viewportWidth } = useLayoutStore()

  return (
    <div
      className={cn(
        'flex flex-col font-normal',
        !isPopoverFeedbackChat && 'md:flex-row',
        sender === 'user'
          ? 'max-w-[75%] self-end'
          : 'w-full max-w-full self-start',
        sender === 'user' ? (isPopoverFeedbackChat ? 'my-2' : 'my-4') : 'my-2',
        className,
      )}
    >
      {sender === 'system' && (
        <AiChatIcon className='mb-3 mr-6 h-[2rem] w-[2rem] flex-shrink-0' />
      )}
      <div className='group flex min-w-0 flex-1 flex-col gap-2'>
        {messages.some((m) => m.sending_agent === 'research_summary_agent') && (
          <div className='mr-8 mt-6 self-end'>
            <ExportPDFButton messageId={userMessage.id} />
          </div>
        )}
        {progressMessages.length + thinkingMessages.length > 0 && (
          <ProgressMessageCollapsible
            accountName={getAccount()}
            viewportWidth={viewportWidth}
            open={thinkingOpen}
            onOpenChange={setThinkingOpen}
            isStreaming={isStreaming}
            softMessages={thinkingMessages}
            temporaryMessages={progressMessages}
          />
        )}
        {chatMessages.map((message) => (
          <Message
            message={message}
            key={getMessageKey(message)}
            isPopoverFeedbackChat={isPopoverFeedbackChat}
          />
        ))}
        {sender === 'system' && deepResearchMessage?.deep_research_plan && (
          <DeepResearchPlan
            plan={deepResearchMessage.deep_research_plan}
            isStreaming={isStreaming}
          />
        )}
        {messages.some((m) => m.sending_agent === 'pdf_agent') && (
          <DownloadPDFButton messageId={userMessage.id} />
        )}
        {sender === 'system' && !isStreaming && showCopyActions && (
          <MessageTooltips
            chatMessages={chatMessages}
            userMessage={userMessage}
            isPopoverFeedbackChat={isPopoverFeedbackChat}
            className='invisible flex opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100'
          />
        )}
        {sender === 'system' &&
          userMessage?.is_last_user_message_for_feedback_chat && (
            <FeedbackMessageSection
              isPopoverFeedbackChat={isPopoverFeedbackChat}
            />
          )}
      </div>
    </div>
  )
}

function FeedbackMessageSection({
  isPopoverFeedbackChat = false,
}: {
  isPopoverFeedbackChat?: boolean
}) {
  return (
    <div className='flex-col'>
      <div className='flex w-full items-center justify-center gap-2'>
        <Separator className={cn(isPopoverFeedbackChat ? 'w-1/5' : 'w-1/2')} />
        <div
          className={cn(
            'text-nowrap text-neutral-400',
            isPopoverFeedbackChat && 'text-xs',
          )}
        >
          End of user's message
        </div>
        <Separator className={cn(isPopoverFeedbackChat ? 'w-1/5' : 'w-1/2')} />
      </div>
      <Alert className='mt-4 flex border border-neutral-200 bg-neutral-100'>
        <InfoIcon className='mr-1 h-4 w-4' />
        <AlertDescription className={cn(isPopoverFeedbackChat && 'text-xs')}>
          Please continue in the chat to provide corrections to the negative
          feedbacks. Click 'Save as Feedback' once satisfied with the correct
          answer. Feedback chats are limited to the current dataset and support
          only SQL Query capabilities.
        </AlertDescription>
      </Alert>
    </div>
  )
}
