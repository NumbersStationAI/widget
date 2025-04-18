import { type MarkdownToJSX } from 'markdown-to-jsx'

import { KnowledgeLayerEntityType, useGetEntityContext } from '@ns/public-api'
import { cn } from '@ns/ui/utils/cn'

/* eslint-disable-next-line import/no-cycle */
import MessageTable from 'components/chat/messages/MessageTable'
import Tableau from 'components/chat/messages/Tableau'
import VegaEmbed from 'components/chat/messages/VegaEmbed'
import { Markdown } from 'components/Markdown'
import { Spinner } from 'components/Spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { getAccount } from 'lib/stores/user'

const options: MarkdownToJSX.Options = {
  overrides: {
    span: {
      component: Span,
    },
  },
}

interface MessageMarkdownProps {
  className?: string
  children: string
}

export default function MessageMarkdown({
  className,
  children,
}: MessageMarkdownProps) {
  return (
    <Markdown
      className={cn(
        'prose prose-sm prose-neutral max-w-none text-primary prose-blockquote:font-medium prose-blockquote:not-italic prose-strong:font-bold prose-pre:rounded-md prose-pre:p-0',
        className,
      )}
      options={options}
    >
      {children}
    </Markdown>
  )
}

function Span({
  children,
  className,
  ...props
}: React.PropsWithChildren<{
  'className'?: string
  'data-type'?: KnowledgeLayerEntityType | 'unknown'
  'data-id'?: string
  'data-is-tooltip'?: boolean
}>) {
  const type = props['data-type']
  const id = props['data-id']
  const isTooltip = props['data-is-tooltip']
  const tagClassName = cn(
    'rounded-md bg-yellow-50 px-2 font-mono text-sm text-yellow-600',
    type === KnowledgeLayerEntityType.dimension && 'bg-green-50 text-green-600',
    type === KnowledgeLayerEntityType.metric && 'bg-blue-50 text-blue-600',
    type === KnowledgeLayerEntityType.mode && 'bg-teal-50 text-teal-600',
    type === KnowledgeLayerEntityType.tableau && 'bg-purple-50 text-purple-600',
    type === KnowledgeLayerEntityType.chart && 'bg-pink-50 text-pink-600',
    className,
  )

  if (type === 'unknown') {
    return <span className={tagClassName}>{children}</span>
  }

  if (type != null && id != null) {
    if (isTooltip) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger className={tagClassName} {...props}>
            {children}
          </TooltipTrigger>
          <TooltipContent
            className='min-w-96 max-w-xl bg-white p-4 text-primary'
            align='start'
            side='bottom'
          >
            <SpanContent id={id} type={type} />
          </TooltipContent>
        </Tooltip>
      )
    }
    return (
      <>
        <div className={cn('my-2', className)} {...props}>
          <SpanContent id={id} type={type} />
        </div>
        <span className={tagClassName}>{children}</span>
      </>
    )
  }

  return (
    <span className={className} {...props}>
      {children}
    </span>
  )
}

function SpanContent({
  id,
  type,
}: {
  id: string
  type: KnowledgeLayerEntityType
}) {
  const { data, isPending, error } = useGetEntityContext({
    accountName: getAccount(),
    params: { entity_id: id, entity_type: type },
  })
  const reset = 'not-prose font-normal not-italic'

  return isPending ? (
    <div
      className={cn(reset, 'flex h-full w-full items-center justify-center')}
    >
      <Spinner size={0.5} />
    </div>
  ) : error ? (
    <div
      className={cn(reset, 'flex h-full w-full items-center justify-center')}
    >
      <span className='text-red-500'>Something went wrong.</span>
    </div>
  ) : data?.embedded_viz_url ? (
    <Tableau className={reset} url={data.embedded_viz_url} />
  ) : data?.vega_spec ? (
    <VegaEmbed className={reset} spec={data.vega_spec} />
  ) : data?.table_message_id ? (
    <MessageTable messageId={data.table_message_id} className={reset} />
  ) : (
    <Markdown className='prose prose-sm prose-neutral text-sm font-normal not-italic'>
      {data?.markdown ?? ''}
    </Markdown>
  )
}
