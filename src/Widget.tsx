import React, { useEffect, useMemo } from 'react'
import { useWidget } from './ChatProvider'
import { useLayoutStore } from 'lib/stores/layout'
import ChatView from 'components/chat/ChatView'

interface WidgetProps {}

const Widget: React.FC<WidgetProps> = ({}) => {
  const { expand, shrink } = useWidget()
  const { expanded } = useLayoutStore()

  useEffect(() => {
    if (expanded) {
      expand()
    } else {
      shrink()
    }
  }, [expanded])

  return (
    <div className='h-full w-full overflow-clip bg-transparent'>
      <ChatView />
    </div>
  )
}

export default Widget
