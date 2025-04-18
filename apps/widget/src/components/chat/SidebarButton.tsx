import { ArrowLeftToLine, Menu } from 'lucide-react'

import { TooltipButton } from 'components/Button'
import { useLayoutStore } from 'lib/stores/layout'

function SidebarButton() {
  const { setShowSidebar, showSidebar } = useLayoutStore()

  return (
    <TooltipButton
      size='icon'
      variant='ghost'
      onClick={() => setShowSidebar(!showSidebar)}
      tooltip={showSidebar ? 'Close sidebar' : 'Open sidebar'}
    >
      {showSidebar ? <ArrowLeftToLine /> : <Menu />}
    </TooltipButton>
  )
}

export default SidebarButton
