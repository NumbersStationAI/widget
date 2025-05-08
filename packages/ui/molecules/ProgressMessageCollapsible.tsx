import { Check, ChevronDown } from 'lucide-react'
import { Fragment } from 'react'

import { type MessageApiResponse } from '@ns/public-api'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../atoms/Collapsible'
import { Spinner } from '../atoms/Spinner'
import { getMessageKey } from '../utils/getMessageKey'

import { MessageMarkdown } from './MessageMarkdown'

type ProgressMessage = Pick<
  MessageApiResponse,
  'id' | 'markdown' | 'response_index'
>

export type ProgressMessageCollapsibleProps = {
  accountName: string
  temporaryMessages: ProgressMessage[]
  softMessages: ProgressMessage[]
  viewportWidth: number | undefined
  isStreaming?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProgressMessageCollapsible({
  accountName,
  temporaryMessages,
  softMessages,
  viewportWidth,
  isStreaming,
  open,
  onOpenChange,
}: ProgressMessageCollapsibleProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <button
          type='button'
          className='group/progress-messages flex h-8 items-center gap-3 rounded-xl bg-neutral-50 px-3 text-sm font-medium'
        >
          {temporaryMessages.length === 0 ? (
            <Check className='h-4 w-4' />
          ) : (
            <Spinner size={0.5} />
          )}
          {temporaryMessages.length === 0 ? (
            <span>Completed</span>
          ) : temporaryMessages[temporaryMessages.length - 1]?.markdown !=
            null ? (
            <MessageMarkdown
              className='prose-sm'
              accountName={accountName}
              viewportWidth={viewportWidth}
            >
              {temporaryMessages[temporaryMessages.length - 1].markdown ?? ''}
            </MessageMarkdown>
          ) : (
            <span>Running</span>
          )}
          {softMessages.length > 0 && (
            <ChevronDown className='h-4 w-4 transition group-aria-expanded/progress-messages:rotate-180' />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className='mt-2.5 border-l-2 border-neutral-200 px-3'>
        {softMessages.map((thinkingMessage, index, all) => (
          <Fragment key={getMessageKey(thinkingMessage)}>
            <div className='my-3'>
              <MessageMarkdown
                accountName={accountName}
                viewportWidth={viewportWidth}
                className='text-neutral-400'
              >
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
  )
}
