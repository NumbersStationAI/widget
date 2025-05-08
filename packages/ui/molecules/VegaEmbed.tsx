import useSize from '@react-hook/size'
import {
  AlertCircle,
  Download,
  RectangleHorizontal,
  Square,
} from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import vegaEmbed, { type Result, type VisualizationSpec } from 'vega-embed'

import { cn } from '@ns/ui/utils/cn'

import { Alert, AlertDescription, AlertTitle } from '../atoms/Alert'
import { TooltipButton } from '../atoms/Button'

import { CodeSheet } from './CodeSheet'

export type VegaEmbedProps = {
  className?: string
  viewportWidth: number | undefined
  spec: string
}

export const VegaEmbed = memo<VegaEmbedProps>(
  ({ className, viewportWidth, spec: json }) => {
    const spec = useMemo(() => JSON.parse(json) as VisualizationSpec, [json])
    const [error, setError] = useState<unknown>()
    const ref = useRef<HTMLDivElement>(null)
    const tableRef = useRef<HTMLDivElement>(null)
    const [offsetLeft, setOffsetLeft] = useState(0)
    const [viewMode, setViewMode] = useState<'default' | 'wide'>('default')
    const [embed, setEmbed] = useState<Result>()
    const embedSize = useSize(ref)

    useEffect(() => {
      async function render(el: HTMLElement) {
        try {
          spec.padding = 10
          setEmbed(
            await vegaEmbed(el, spec, {
              actions: false,
              renderer: 'svg',
              ast: true,
            }),
          )
        } catch (e) {
          setError(e)
        }
      }
      if (ref.current) render(ref.current)
    }, [spec, embedSize])

    useEffect(() => {
      setOffsetLeft(tableRef.current?.offsetLeft || 0)
    }, [viewportWidth, viewMode])

    const onDownload = useCallback(async () => {
      const url = await embed?.view.toImageURL('png', 10)
      if (!url) return
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('target', '_blank')
      link.setAttribute('download', 'vega-chart.png')
      link.dispatchEvent(new MouseEvent('click'))
    }, [embed])

    return error != null ? (
      <Alert className={className} variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{`There was an issue rendering this chart: ${String(error)}`}</AlertDescription>
      </Alert>
    ) : (
      <div className={cn('max-w-full flex-1', className)} ref={tableRef}>
        <div
          className='flex flex-col items-end'
          style={{
            marginLeft: viewMode === 'wide' ? -offsetLeft + 28 : 0,
            width: viewMode === 'wide' ? (viewportWidth ?? 0) - 64 : '',
          }}
        >
          <div className='flex items-center gap-1 py-1'>
            <CodeSheet code={JSON.stringify(spec, null, 2)} language='JSON' />
            <TooltipButton
              size='icon'
              variant='ghost'
              tooltip='Download'
              onClick={() =>
                toast.promise(onDownload, {
                  loading: 'Downloading vega chart...',
                  success: () => `Download complete`,
                  error: 'Error downloading csv',
                })
              }
            >
              <Download />
            </TooltipButton>
            {viewportWidth != null && viewMode === 'default' && (
              <TooltipButton
                size='icon'
                variant='ghost'
                className='hidden md:flex'
                onClick={() => {
                  setViewMode('wide')
                  // setShowSidebar(false)
                }}
                tooltip='Expand view'
              >
                <RectangleHorizontal />
              </TooltipButton>
            )}
            {viewportWidth != null && viewMode === 'wide' && (
              <TooltipButton
                size='icon'
                variant='ghost'
                className='hidden md:flex'
                onClick={() => setViewMode('default')}
                tooltip='Center view'
              >
                <Square />
              </TooltipButton>
            )}
          </div>
          <div ref={ref} className='w-full overflow-x-auto rounded-lg border' />
        </div>
      </div>
    )
  },
)
