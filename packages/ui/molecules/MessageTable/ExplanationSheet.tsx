import copy from 'copy-to-clipboard'
import { Copy, Maximize, Minimize, TextSearch } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useExplainSqlMessage } from '@ns/public-api'
import { cn } from '@ns/ui/utils/cn'

import { Button, TooltipButton } from '../../atoms/Button'
import { Sheet, SheetClose, SheetContent } from '../../atoms/Sheet'
import { Spinner } from '../../atoms/Spinner'
/* eslint-disable-next-line import/no-cycle */
import { MessageMarkdown } from '../MessageMarkdown'

function formatExplanationToString(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line.trim().replace(/^-|[*`]/g, (match) => (match === '-' ? '•' : '')),
    )
    .join('\n')
}

export function ExplanationSheet({
  accountName,
  messageId,
}: {
  accountName: string
  messageId: string
}) {
  const { data, isPending, error } = useExplainSqlMessage({
    accountName,
    messageId,
  })
  const [{ open, isFullscreen }, setState] = useState({
    open: false,
    isFullscreen: false,
  })
  const handleCopy = () => {
    const success = copy(formatExplanationToString(data?.response ?? ''))
    toast(
      success
        ? 'Explanation copied to clipboard'
        : 'Failed to copy to clipboard',
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => setState((prev) => ({ ...prev, open: value }))}
    >
      <TooltipButton
        size='icon'
        variant='ghost'
        className='hidden md:flex'
        onClick={() => setState((prev) => ({ ...prev, open: true }))}
        tooltip='Explanations'
      >
        <TextSearch />
      </TooltipButton>
      <SheetContent
        className={cn('flex flex-col p-0')}
        isFullscreen={isFullscreen}
      >
        <div className='flex items-center gap-2 border-b px-4 py-2'>
          <p>Explanation</p>
          <div className='flex-1' />
          <Button size='icon' variant='ghost' onClick={handleCopy}>
            <Copy />
          </Button>
          <TooltipButton
            size='icon'
            variant='ghost'
            className='hidden md:flex'
            onClick={() =>
              setState((prev) => ({
                ...prev,
                isFullscreen: !prev.isFullscreen,
              }))
            }
            tooltip={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullscreen ? <Minimize /> : <Maximize />}
          </TooltipButton>
          <SheetClose className='p-2' />
        </div>
        <div className='h-full max-h-full w-full max-w-full overflow-auto p-4'>
          {isPending ? (
            <Spinner />
          ) : error ? (
            <span className='text-red-600'>
              Something went wrong. Please try again later.
            </span>
          ) : (
            <MessageMarkdown
              accountName={accountName}
              viewportWidth={undefined}
              className={cn(
                '[&>:first-child]:mt-0 [&>:last-child]:mb-0 [&>blockquote>p]:my-2 [&>blockquote]:my-4 [&>h1]:mb-4 [&>h1]:mt-8 [&>h2]:mb-4 [&>h2]:mt-6 [&>h3]:mb-3 [&>h3]:mt-4 [&>ol>li]:my-2 [&>ol]:my-4 [&>p]:my-4 [&>p]:leading-7 [&>ul>li]:my-2 [&>ul]:my-4',
              )}
            >
              {data.response}
            </MessageMarkdown>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
