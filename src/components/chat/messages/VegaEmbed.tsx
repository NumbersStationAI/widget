import { TooltipButton } from 'components/Button'
import ErrorAlert from 'components/ErrorAlert'
import { Download, RectangleHorizontal, Square } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import vegaEmbed, { Result } from 'vega-embed'
import CodeSheet from './CodeSheet'
import { useLayoutStore } from 'lib/stores/layout'
import { toast } from 'sonner'
import useSize from '@react-hook/size'

const VegaEmbed = memo(({ spec }: { spec: string }) => {
  const [error, setError] = useState<unknown>()
  const ref = useRef<HTMLDivElement>(null)
  const { viewportWidth } = useLayoutStore()
  const tableRef = useRef<HTMLDivElement>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)
  const [viewMode, setViewMode] = useState<'default' | 'wide'>('default')
  const [embed, setEmbed] = useState<Result>()
  const embedSize = useSize(ref)

  useEffect(() => {
    async function render(el: HTMLElement) {
      try {
        setEmbed(
          await vegaEmbed(el, spec, {
            actions: false,
            width: embedSize[0] - 120,
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
    var link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('target', '_blank')
    link.setAttribute('download', 'vega-chart.png')
    link.dispatchEvent(new MouseEvent('click'))
  }, [embed])

  return error != null ? (
    <ErrorAlert
      message={`There was an issue rendering this chart: ${error}`}
      // error={error}
      // title='There was an issue rendering this chart.'
    />
  ) : (
    <div className='max-w-full flex-1' ref={tableRef}>
      <div
        className='flex flex-col items-end'
        style={{
          marginLeft: viewMode === 'wide' ? -offsetLeft + 28 : 0,
          width: viewMode === 'wide' ? viewportWidth - 64 : '',
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
                success: (data) => {
                  return `Download complete`
                },
                error: 'Error downloading csv',
              })
            }
          >
            <Download />
          </TooltipButton>
          {viewMode === 'default' && (
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
          {viewMode === 'wide' && (
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

        <div
          ref={ref}
          className='w-full overflow-x-auto rounded-lg border p-2'
        />
      </div>
    </div>
  )
})

export default VegaEmbed
