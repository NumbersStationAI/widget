import { cn } from '@ns/ui/utils/cn'

interface TableauProps {
  id?: string
  src: string | undefined
  height?: string | number
  width?: string
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tableau-viz': TableauProps
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export type TableauEmbedProps = {
  url?: string
  className?: string
}

export function TableauEmbed({ url, className }: TableauEmbedProps) {
  return (
    <div className={cn('h-fit w-full', className)}>
      <tableau-viz id='tableauViz' src={url} hide-tabs />
    </div>
  )
}
