import { Check, ChevronDown, InfoIcon } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { InstructionState, RenderType } from '@ns/public-api'
import { cn } from '@ns/ui/utils/cn'

import { Alert, AlertDescription } from 'components/Alert'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'components/Collapsible'
import { DownloadPDFButton } from 'components/DownloadPDFButton'
import { ExportPDFButton } from 'components/ExportPDFButton'
import { Separator } from 'components/Separator'
import { Spinner } from 'components/Spinner'
import { ReactComponent as AiChatIcon } from 'lib/icons/ai-chat.svg?react'
import { type ChatMessage } from 'lib/models/message'
import { getMessageKey } from 'lib/utils/message'

import { DeepResearchPlan } from './DeepResearchPlan'
import { Message } from './Message'
import MessageMarkdown from './MessageMarkdown'
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
  const progressMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.render_type === RenderType.TEMPORARY ||
          message.render_type === 'LOADING',
      ),
    [messages],
  )
  const thinkingMessages = useMemo(
    () => messages.filter((message) => message.render_type === RenderType.SOFT),
    [messages],
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
          <Collapsible open={thinkingOpen} onOpenChange={setThinkingOpen}>
            <CollapsibleTrigger asChild>
              <button
                type='button'
                className='group/progress-messages flex h-8 items-center gap-3 rounded-xl bg-neutral-50 px-3 text-sm font-medium'
              >
                {progressMessages.length === 0 ? (
                  <Check className='h-4 w-4' />
                ) : (
                  <Spinner size={0.5} />
                )}
                {progressMessages.length === 0 ? (
                  <span>Completed</span>
                ) : progressMessages[progressMessages.length - 1]?.markdown !=
                  null ? (
                  <MessageMarkdown>
                    {progressMessages[progressMessages.length - 1].markdown ??
                      ''}
                  </MessageMarkdown>
                ) : (
                  <span>Running</span>
                )}
                {thinkingMessages.length > 0 && (
                  <ChevronDown className='h-4 w-4 transition group-aria-expanded/progress-messages:rotate-180' />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-2.5 border-l-2 border-neutral-200 px-3'>
              {thinkingMessages.map((thinkingMessage, index, all) => (
                <Fragment key={thinkingMessage.id}>
                  <div className='my-3'>
                    <MessageMarkdown className='text-neutral-400'>
                      {thinkingMessage.markdown ?? ''}
                    </MessageMarkdown>
                  </div>
                  {index === all.length - 1 && isStreaming && (
                    <p className='animate-pulse text-sm'>Thinking...</p>
                  )}
                  <div className='my-3 h-px bg-neutral-200 last:hidden' />
                </Fragment>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        {chatMessages.map((message) => (
          <Message
            message={message}
            key={getMessageKey(message.id, message.response_index)}
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
