import ExpandButton from './ExpandButton'
import NewChatButton from './NewChatButton'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from 'components/Resizable'
import Sidebar from './Sidebar'
import MessageView from './MessageView'
import { useLayoutStore } from 'lib/stores/layout'
import HideButton from './HideButton'
import ChatInput from './input/ChatInput'
import SidebarButton from './SidebarButton'
import { useBreakpoint } from 'lib/hooks/tailwind'
import { useEffect, useMemo, useState } from 'react'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLocalStorage } from 'usehooks-ts'

const ChatView: React.FC = () => {
  const { showSidebar, setShowSidebar, expanded } = useLayoutStore()
  const { showWidgetBorder, showExpandButton, showMinimizeButton } =
    useCustomizationStore()
  const [animateSidebar, setAnimateSidebar] = useState(true)
  const isDesktop = useBreakpoint('md')
  const [sidebarWidth, setSidebarWidth] = useState(25)
  const [isDragging, setIsDragging] = useState(false)
  const [showSidebarLocalStorage, setShowSidebarLocalStorage] = useLocalStorage(
    'sidebarWidth',
    25,
  )

  const showExpandedView = useMemo(() => {
    return isDesktop && expanded
  }, [isDesktop, expanded])

  useEffect(() => {
    setShowSidebarLocalStorage(sidebarWidth)
  }, [sidebarWidth, setShowSidebarLocalStorage])

  return (
    <ResizablePanelGroup
      direction='horizontal'
      className={`h-full w-full overflow-clip ${showWidgetBorder && 'border border-border/50'} bg-white`}
    >
      <ResizablePanel
        defaultSize={showSidebarLocalStorage}
        onResize={(size) => setSidebarWidth(size)}
        className={`${showSidebar && showExpandedView ? 'min-w-[13rem] max-w-[32rem]' : 'w-0 max-w-0'} ${animateSidebar && 'transition-all'}`}
      >
        {showExpandedView ? (
          <Sidebar onChatSelected={() => {}} />
        ) : (
          <>
            <div
              onClick={() => setShowSidebar(false)}
              className={`absolute bottom-0 left-0 right-0 top-0 z-40 bg-black/10 transition-all ${showSidebar ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
            />
            <div
              className={`absolute bottom-0 top-0 z-50 w-fit max-w-[80%] transition-all ${showSidebar ? 'pointer-events-auto left-0' : 'pointer-events-none -left-[100%]'}`}
            >
              <Sidebar onChatSelected={() => setShowSidebar(false)} />
            </div>
          </>
        )}
      </ResizablePanel>
      {showExpandedView && (
        <ResizableHandle
          hitAreaMargins={{ coarse: 15, fine: 0 }}
          className={`w-[11px] bg-clip-content px-[5px] hover:bg-[#A3A3A3] hover:px-[4px] ${isDragging ? 'bg-[#A3A3A3] px-[4px]' : ''}`}
          onDragging={(isDragging) => {
            if (isDragging) {
              setAnimateSidebar(false)
              setIsDragging(true)
            } else {
              setAnimateSidebar(true)
              setIsDragging(false)
            }
          }}
        />
      )}

      <ResizablePanel
        defaultSize={75}
        className='flex h-full w-full flex-col items-center justify-center overflow-clip pb-4'
      >
        {(showExpandButton ||
          showMinimizeButton ||
          !showSidebar ||
          !showExpandedView ||
          !showSidebar) && (
          <div
            className={`flex w-full items-center ${showExpandedView ? 'gap-2 px-6' : 'gap-1 pl-3 pr-4'} mt-2 pb-2`}
          >
            {!showSidebar && <SidebarButton />}
            <div className='flex-1' />
            {(!showSidebar || !showExpandedView) && <NewChatButton expanded />}
            {showExpandButton && <ExpandButton />}
            {showMinimizeButton && <HideButton />}
          </div>
        )}
        <MessageView />
        <div
          className={`${showExpandedView ? 'flex w-full flex-col items-center px-4' : 'fixed bottom-4 flex w-full items-center justify-center px-4'}`}
        >
          <ChatInput />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default ChatView
