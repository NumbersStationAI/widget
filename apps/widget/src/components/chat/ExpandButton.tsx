import { Maximize } from 'lucide-react'

import { TooltipButton } from '@ns/ui/atoms/Button'

import Compress from 'lib/icons/compress.svg?react'
import { useLayoutStore } from 'lib/stores/layout'

function ExpandButton() {
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
