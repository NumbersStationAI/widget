import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import { cn } from '@ns/ui/utils/cn'

import { useWidget } from 'ChatProvider'
import ExpandButton from 'components/chat/ExpandButton'
import { FeedbackView } from 'components/chat/feedback/FeedbackView'
import HideButton from 'components/chat/HideButton'
import ChatInput from 'components/chat/input/ChatInput'
import MessageView from 'components/chat/MessageView'
import NewChatButton from 'components/chat/NewChatButton'
import { PanelView } from 'components/chat/PanelView'
import { Sidebar } from 'components/chat/Sidebar'
import SidebarButton from 'components/chat/SidebarButton'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from 'components/Resizable'
import { useBreakpoint } from 'lib/hooks/tailwind'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { useUserStore } from 'lib/stores/user'

export const Route = createFileRoute('/_widget')({ component: Widget })

function Widget() {
  const { expand, shrink } = useWidget()
  const { expanded } = useLayoutStore()

  useEffect(() => {
    if (expanded) {
      expand()
    } else {
      shrink()
    }
  }, [expand, expanded, shrink])

  return (
    <div className='h-full w-full overflow-clip bg-transparent'>
      <ChatView />
    </div>
  )
}

function ChatView() {
  const { isFeedbackChat } = useUserStore()
  const { showSidebar, setShowSidebar, expanded, rightPanelOpen } =
    useLayoutStore()
  const {
    state: { showExpandButton, showMinimizeButton, showInput },
  } = useCustomizationStore()
  const { feedbackChatId } = usePanelChatStore()
  const [animateSidebar, setAnimateSidebar] = useState(true)
  const isDesktop = useBreakpoint('md')
  const [sidebarWidth, setSidebarWidth] = useState(25)
  const [isDragging, setIsDragging] = useState(false)
  const [showSidebarLocalStorage, setShowSidebarLocalStorage] = useLocalStorage(
    'sidebarWidth',
    25,
  )

  const showExpandedView = isDesktop && expanded

  useEffect(() => {
    setShowSidebarLocalStorage(sidebarWidth)
  }, [sidebarWidth, setShowSidebarLocalStorage])

  if (isFeedbackChat) {
    return (
      <div className='flex h-full w-full flex-col items-center justify-center overflow-clip pb-4'>
        <MessageView />
        <div className='flex w-full flex-col items-center px-4'>
          {showInput && <ChatInput />}
        </div>
      </div>
    )
  }

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <ResizablePanelGroup
        direction='horizontal'
        className='h-full w-full overflow-clip bg-white transition-transform duration-300 ease-in-out'
      >
        <ResizablePanel
          defaultSize={showSidebarLocalStorage}
          onResize={(size) => setSidebarWidth(size)}
          className={cn(
            showSidebar && showExpandedView
              ? 'min-w-[13rem] max-w-[32rem]'
              : 'w-0 max-w-0',
            animateSidebar && 'transition-all',
          )}
        >
          {showExpandedView ? (
            <Sidebar onChatSelected={() => {}} />
          ) : (
            <>
              <div
                onClick={() => setShowSidebar(false)}
                className={cn(
                  'absolute bottom-0 left-0 right-0 top-0 z-40 bg-black/10 transition-all',
                  showSidebar
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0',
                )}
              />
              <div
                className={cn(
                  'absolute bottom-0 top-0 z-50 w-fit max-w-[80%] transition-all',
                  showSidebar
                    ? 'pointer-events-auto left-0'
                    : 'pointer-events-none -left-[100%]',
                )}
              >
                <Sidebar onChatSelected={() => setShowSidebar(false)} />
              </div>
            </>
          )}
        </ResizablePanel>
        {showExpandedView && showSidebar && (
          <ResizableHandle
            hitAreaMargins={{ coarse: 15, fine: 0 }}
            className={cn(
              'w-[11px] bg-clip-content px-[5px] hover:bg-[#A3A3A3] hover:px-1',
              isDragging && 'bg-[#A3A3A3] px-1',
            )}
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
          defaultSize={67}
          className={cn(
            'flex h-full w-full flex-col items-center justify-center overflow-clip pb-4',
            showSidebar && '-ml-[5px]',
          )}
        >
          {(showExpandButton ||
            showMinimizeButton ||
            !showSidebar ||
            !showExpandedView ||
            !showSidebar) && (
            <div
              className={cn(
                'mt-2 flex w-full items-center pb-2',
                showExpandedView ? 'gap-2 px-6' : 'gap-1 pl-3 pr-4',
              )}
            >
              {!showSidebar && !rightPanelOpen && <SidebarButton />}
              <div className='flex-1 text-center' />
              {(!showSidebar || !showExpandedView) && (
                <NewChatButton expanded />
              )}
              {showExpandButton && <ExpandButton />}
              {showMinimizeButton && <HideButton />}
            </div>
          )}
          <Outlet />
        </ResizablePanel>
        {rightPanelOpen && (
          <ResizablePanel
            defaultSize={33}
            className='min-w-[20rem] max-w-[40rem] overflow-auto'
          >
            {feedbackChatId ? <FeedbackView /> : <PanelView />}
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
