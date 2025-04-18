import { createFileRoute } from '@tanstack/react-router'

import { cn } from '@ns/ui/utils/cn'

import ChatInput from 'components/chat/input/ChatInput'
import MessageView from 'components/chat/MessageView'
import { useBreakpoint } from 'lib/hooks/tailwind'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLayoutStore } from 'lib/stores/layout'

export const Route = createFileRoute('/_widget/chats')({ component: Chats })

function Chats() {
  const { isReadOnlyChat, cloneChat, currentChat } = useChatStore()
  const { expanded, rightPanelOpen } = useLayoutStore()
  const {
    state: { showInput },
  } = useCustomizationStore()
  const isDesktop = useBreakpoint('md')
  const showExpandedView = isDesktop && expanded
  return (
    <>
      {isReadOnlyChat && (
        <div className='w-full border-y border-neutral-200 bg-neutral-50 p-3 text-center'>
          This chat is read-only. To make changes or continue the conversation,
          please&nbsp;
          <button
            type='button'
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
        className={cn('flex w-full flex-col px-4', {
          'items-center': showExpandedView && !rightPanelOpen,
          'fixed bottom-4 items-center justify-center': !showExpandedView,
        })}
      >
        {showInput && <ChatInput />}
      </div>
    </>
  )
}
