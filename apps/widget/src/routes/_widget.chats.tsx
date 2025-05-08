import { createFileRoute } from '@tanstack/react-router'

import { cn } from '@ns/ui/utils/cn'

import ChatInput from 'components/chat/input/ChatInput'
import MessageView from 'components/chat/MessageView'
import { useBreakpoint } from 'lib/hooks/tailwind'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLayoutStore } from 'lib/stores/layout'

type RouteSearch = Record<string, unknown> & { deepResearch?: boolean }

export const Route = createFileRoute('/_widget/chats')({
  component: Chats,
  validateSearch: (search: Record<string, unknown>): RouteSearch => {
    const { deepResearch } = search
    return {
      ...search,
      deepResearch: typeof deepResearch === 'boolean' ? deepResearch : false,
    }
  },
})

function Chats() {
  const { isReadOnlyChat, cloneChat, currentChat } = useChatStore()
  const { expanded } = useLayoutStore()
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
        className={cn('flex w-full flex-col items-center px-4', {
          'fixed bottom-4 justify-center': !showExpandedView,
        })}
      >
        {showInput && <ChatInput />}
      </div>
    </>
  )
}
