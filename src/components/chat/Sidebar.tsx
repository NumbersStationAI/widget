import { Button } from 'components/Button'
import NewChatButton from 'components/chat/NewChatButton'
import Spinner from 'components/Spinner'
import { APP_URL } from 'lib/constants'
import { ReactComponent as FullLogo } from 'lib/icons/full-logo.svg'
import { ReactComponent as Logo } from 'lib/icons/logo.svg'
import { ReactComponent as OpenExternal } from 'lib/icons/open-external.svg'
import { Chat } from 'lib/models/chat'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { getAccount } from 'lib/stores/user'
import { useEffect, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ChatListItem } from './ChatListItem'
import SidebarButton from './SidebarButton'

interface SidebarProps {
  onChatSelected: (chat: Chat) => void
}

export function Sidebar({ onChatSelected = () => { } }: SidebarProps) {
  const { chats, currentChat, totalChats, chatsOffset, fetchChats } = useChatStore()
  const { showOpenInFullButton } = useCustomizationStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(([entry]) => {
      const { clientHeight, scrollHeight } = entry.target
      if (clientHeight === scrollHeight && totalChats > chatsOffset) fetchChats()
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [totalChats, chatsOffset, fetchChats])

  return (
    <div className='group/sidebar flex h-screen max-h-screen w-[75vw] flex-col gap-4 bg-white pb-1 transition-all md:w-full'>
      <div className='flex h-[3.5rem] w-full flex-row items-center justify-start gap-2 px-4'>
        <Logo width='20' height='20' className='flex-shrink-0' />
        <h1 className='line-clamp-1 overflow-hidden text-sm font-semibold'>
          Analytics Copilot
        </h1>
        <div className='flex-1' />
        <div className='w-6 scale-0 opacity-0 transition-opacity group-hover/sidebar:scale-100 group-hover/sidebar:opacity-100'>
          <SidebarButton />
        </div>
      </div>
      <div className='w-full px-4'>
        <NewChatButton expanded className='h-10 w-full' />
      </div>
      <div
        ref={containerRef}
        className='flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2'
        id='scrollableDiv'
      >
        <h2 className='px-3 text-xs font-medium'>Recent</h2>
        <InfiniteScroll
          dataLength={chats.length}
          next={fetchChats}
          hasMore={totalChats > chatsOffset}
          loader={
            <div className='flex w-full justify-center'>
              <Spinner size={0.5} />
            </div>
          }
          className='flex flex-col gap-2'
          scrollableTarget='scrollableDiv'
        >
          {chats.map((chat, index) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              index={index}
              onChatSelected={onChatSelected}
            />
          ))}
        </InfiniteScroll>
      </div>
      <div className='h-fit px-4'>
        {showOpenInFullButton && (
          <a
            href={`${APP_URL}/${getAccount()}/widget/${currentChat?.id}`}
            target='_blank'
            rel='noreferrer'
            className='!no-underline'
          >
            <Button
              variant='ghost'
              className='flex w-full items-center justify-start gap-2 px-3 text-sm'
            >
              <OpenExternal />
              Open full app
            </Button>
          </a>
        )}
        <div className='mx-4 mb-4 mt-3 flex gap-2 whitespace-nowrap text-[0.6rem] text-foreground/50'>
          Powered by <FullLogo />
        </div>
      </div>
    </div>
  )
}
