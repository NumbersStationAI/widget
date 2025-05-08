import { type MarkdownToJSX } from 'markdown-to-jsx'
import { createContext, useContext } from 'react'

import { KnowledgeLayerEntityType, useGetEntityContext } from '@ns/public-api'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../atoms/HoverCard'
import { Markdown } from '../atoms/Markdown'
import { Spinner } from '../atoms/Spinner'
import { cn } from '../utils/cn'

/* eslint-disable-next-line import/no-cycle */
import { MessageTable } from './MessageTable'
import { TableauEmbed } from './TableauEmbed'
import { VegaEmbed } from './VegaEmbed'

const options: MarkdownToJSX.Options = {
  overrides: {
    span: {
      component: Span,
    },
  },
}

const PropsContext = createContext<
  Pick<MessageMarkdownProps, 'accountName' | 'viewportWidth'>
>({
  accountName: '',
  viewportWidth: undefined,
})

export type MessageMarkdownProps = {
  accountName: string
  viewportWidth: number | undefined
  className?: string
  children: string
}

export function MessageMarkdown({
  className,
  children,
  ...props
}: MessageMarkdownProps) {
  return (
    <PropsContext.Provider value={props}>
      <Markdown
        className={cn(
          'prose prose-neutral text-primary prose-blockquote:font-medium prose-blockquote:not-italic prose-strong:font-bold prose-pre:rounded-md prose-pre:p-0 max-w-none',
          className,
        )}
        options={options}
      >
        {children}
      </Markdown>
    </PropsContext.Provider>
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
    'rounded-md bg-yellow-50 px-2 font-mono text-sm text-yellow-600 no-underline',
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
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger className={tagClassName} {...props}>
            {children}
          </HoverCardTrigger>
          <HoverCardContent
            className='text-primary min-w-96 max-w-xl bg-white p-4'
            align='start'
            side='bottom'
          >
            <SpanContent id={id} type={type} />
          </HoverCardContent>
        </HoverCard>
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
  const { accountName, viewportWidth } = useContext(PropsContext)
  const { data, isPending, error } = useGetEntityContext({
    accountName,
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
    <TableauEmbed className={reset} url={data.embedded_viz_url} />
  ) : data?.vega_spec ? (
    <VegaEmbed
      className={reset}
      spec={data.vega_spec}
      viewportWidth={viewportWidth}
    />
  ) : data?.table_message_id ? (
    <MessageTable
      accountName={accountName}
      messageId={data.table_message_id}
      className={reset}
      sql={undefined}
      viewportWidth={viewportWidth}
    />
  ) : (
    <Markdown className='prose prose-sm prose-neutral text-sm font-normal not-italic'>
      {data?.markdown ?? ''}
    </Markdown>
  )
}
