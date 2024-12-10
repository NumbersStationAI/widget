import { TooltipButton } from 'components/Button'
import { ReactComponent as Compress } from 'lib/icons/compress.svg'
import { useLayoutStore } from 'lib/stores/layout'
import { Maximize } from 'lucide-react'

const ExpandButton: React.FC = () => {
  const { expanded, toggleExpanded } = useLayoutStore()
  return (
    <TooltipButton
      onClick={toggleExpanded}
      size='icon'
      variant='ghost'
      className='rounded-md'
      tooltip={expanded ? 'Exit full screen' : 'Full screen'}
    >
      {expanded ? <Compress /> : <Maximize />}
    </TooltipButton>
  )
}

export default ExpandButton
