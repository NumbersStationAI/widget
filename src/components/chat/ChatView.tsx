import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from 'components/Resizable'
import { useBreakpoint } from 'lib/hooks/tailwind'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLayoutStore } from 'lib/stores/layout'
import { useUserStore } from 'lib/stores/user'
import { cn } from 'lib/utils'
import { FC, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import ExpandButton from './ExpandButton'
import HideButton from './HideButton'
import ChatInput from './input/ChatInput'
import MessageView from './MessageView'
import NewChatButton from './NewChatButton'
import { Sidebar } from './Sidebar'
import SidebarButton from './SidebarButton'

const ChatView: FC = () => {
  const { isFeedbackChat } = useUserStore()
  const { isReadOnlyChat, cloneChat, currentChat } = useChatStore()
  const { showSidebar, setShowSidebar, expanded, rightPanelOpen } = useLayoutStore()
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

  if (isFeedbackChat) {
    return (
      <div className='flex h-full w-full flex-col items-center justify-center overflow-clip pb-4'>
        <MessageView />
        <div className='flex w-full flex-col items-center px-4'>
          <ChatInput />
        </div>
      </div>
    )
  }

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <ResizablePanelGroup
        direction='horizontal'
        className={cn(
          'h-full w-full overflow-clip transition-transform duration-300 ease-in-out bg-white',
          showWidgetBorder && 'border border-border/50'
        )}
      >
        <ResizablePanel
          defaultSize={showSidebarLocalStorage}
          onResize={(size) => setSidebarWidth(size)}
          className={cn(
            showSidebar && showExpandedView ? 'min-w-[13rem] max-w-[32rem]' : 'w-0 max-w-0',
            animateSidebar && 'transition-all'
          )}
        >
          {showExpandedView ? (
            <Sidebar onChatSelected={() => { }} />
          ) : (
            <>
              <div
                onClick={() => setShowSidebar(false)}
                className={cn(
                  'absolute bottom-0 left-0 right-0 top-0 z-40 bg-black/10 transition-all',
                  showSidebar ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                )}
              />
              <div
                className={cn(
                  'absolute bottom-0 top-0 z-50 w-fit max-w-[80%] transition-all',
                  showSidebar ? 'pointer-events-auto left-0' : 'pointer-events-none -left-[100%]'
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
              'w-[11px] bg-clip-content px-[5px] hover:bg-[#A3A3A3] hover:px-[4px]',
              isDragging && 'bg-[#A3A3A3] px-[4px]'
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
          defaultSize={75}
          className={cn(
            'flex h-full w-full flex-col items-center justify-center overflow-clip pb-4',
            showSidebar && '-ml-[5px]'
          )}
        >
          {(showExpandButton ||
            showMinimizeButton ||
            !showSidebar ||
            !showExpandedView ||
            !showSidebar) && (
              <div
                className={cn(
                  'flex w-full items-center mt-2 pb-2',
                  showExpandedView ? 'gap-2 px-6' : 'gap-1 pl-3 pr-4'
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
          {isReadOnlyChat && (
            <div className='w-full border-y border-neutral-200 bg-neutral-50 p-3 text-center'>
              This chat is read-only. To make changes or continue the
              conversation, please&nbsp;
              <button
                onClick={() => {
                  if (!currentChat) return
                  cloneChat(currentChat.id)
                }}
                className='cursor-pointer border-0 bg-transparent p-0 underline'
              >
                clone it.
              </button>
            </div>
          )}
          <MessageView />
          <div
            className={cn(
              'flex w-full flex-col px-4',
              {
                'items-center': showExpandedView && !rightPanelOpen,
                'fixed bottom-4 items-center justify-center': !showExpandedView
              }
            )}
          >
            <ChatInput />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ChatView