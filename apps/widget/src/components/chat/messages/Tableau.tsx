import { cn } from '@ns/ui/utils/cn'

interface TableauProps {
  id?: string
  src: string | undefined
  height?: string | number
  width?: string
  style?: any
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tableau-viz': TableauProps
    }
  }
}

interface Props {
  url?: string
  className?: string
}
function Tableau({ url, className }: Props) {
  return (
    <div className={cn('h-fit w-full', className)}>
      <tableau-viz id='tableauViz' src={url} hide-tabs />
    </div>
  )
}

export default Tableau
