import { TooltipButton } from 'components/Button'
import { useLayoutStore } from 'lib/stores/layout'
import { ChevronDown } from 'lucide-react'

const ExpandButton: React.FC = () => {
  const { hideWidget } = useLayoutStore()
  return (
    <TooltipButton
      onClick={hideWidget}
      size='icon'
      variant='ghost'
      className='rounded-md'
      tooltip='Close'
    >
      <ChevronDown />
    </TooltipButton>
  )
}

export default ExpandButton
