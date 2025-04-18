import { ChevronDown } from 'lucide-react'

import { TooltipButton } from 'components/Button'
import { useLayoutStore } from 'lib/stores/layout'

function ExpandButton() {
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
