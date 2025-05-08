import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

import { type SuggestionApi } from '@ns/public-api'
import { MessageMarkdown } from '@ns/ui/molecules/MessageMarkdown'
import {
  MessageRichTextInput,
  MessageRichTextInputContent,
} from '@ns/ui/molecules/MessageRichTextInput'
import { TableauEmbed } from '@ns/ui/molecules/TableauEmbed'
import { VegaEmbed } from '@ns/ui/molecules/VegaEmbed'
import { cn } from '@ns/ui/utils/cn'

import { type ChatMessage } from 'lib/models/message'
import { useChatStore } from 'lib/stores/chat'
import { useLayoutStore } from 'lib/stores/layout'
import { getAccount } from 'lib/stores/user'

import { MessageContextProvider } from './MessageContext'
import { MessageTable } from './MessageTable'

export type MessageProps = {
  message: ChatMessage
  isPopoverFeedbackChat: boolean
}

export function Message({ message, isPopoverFeedbackChat }: MessageProps) {
  const context = useMemo(() => ({ message }), [message])
  const { viewportWidth } = useLayoutStore()
  return (
    <MessageContextProvider value={context}>
      <div
        className={`flex flex-col ${message.sending_agent !== 'user' ? 'w-full' : 'w-fit self-end rounded-xl bg-[#F5F5F5] px-4 py-2'} max-w-full justify-center gap-1`}
        id={message.id}
      >
        {message.sending_agent === 'user' ? (
          <MessageRichTextInput readOnly value={message.markdown ?? ''}>
            <MessageRichTextInputContent />
          </MessageRichTextInput>
        ) : message.markdown ? (
          <MessageMarkdown
            accountName={getAccount()}
            viewportWidth={viewportWidth}
            className={cn('!text-base', isPopoverFeedbackChat && '!text-sm')}
          >
            {message.markdown}
          </MessageMarkdown>
        ) : null}
        {message.message_table_id && (
          <MessageTable isPopoverFeedbackChat={isPopoverFeedbackChat} />
        )}
        {message.vega_spec && message.vega_spec !== undefined && (
          <VegaEmbed spec={message.vega_spec} viewportWidth={viewportWidth} />
        )}
        {message.embedded_viz_url && (
          <TableauEmbed url={message.embedded_viz_url} />
        )}
        {message.questions && message.questions.length > 0 && (
          <div className='mt-6 flex flex-col gap-6'>
            <p className='text-[1rem]'>
              Here are some suggested questions from your knowledge base:
            </p>
            {(message.questions as SuggestionApi[])?.map(
              (question: SuggestionApi) => (
                <SuggestionItem key={question.short_id} suggestion={question} />
              ),
            )}
          </div>
        )}
      </div>
    </MessageContextProvider>
  )
}

type SuggestionItemProps = { suggestion: SuggestionApi }

function SuggestionItem({ suggestion }: SuggestionItemProps) {
  const { sendMessage } = useChatStore()
  return (
    <button
      type='button'
      className='flex max-w-[486px] items-center justify-between gap-2 rounded-md border px-3 py-2 hover:bg-[hsl(var(--foreground)_/_0.02);]'
      onClick={() => {
        sendMessage(
          `${suggestion.prompt} #[${suggestion.asset_name}](ds-${suggestion.short_id})`,
        )
      }}
    >
      <div className='flex flex-col gap-2'>
        <p className='text-left text-[1rem]'>{suggestion.prompt}</p>
        <p className='line-clamp-1 w-fit rounded-sm bg-[#EFF5FF] px-1 text-left text-[#3B82F6]'>
          {suggestion.asset_name}
        </p>
      </div>
      <ChevronRight className='h-4 w-4 flex-shrink-0' />
    </button>
  )
}
