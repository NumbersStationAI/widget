import { Link } from '@tanstack/react-router'
import { MessageSquarePlus } from 'lucide-react'
import { useEffect, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { type ChatApiResponse } from '@ns/public-api'
import { Button } from '@ns/ui/atoms/Button'
import { Spinner } from '@ns/ui/atoms/Spinner'

import NewChatButton from 'components/chat/NewChatButton'
import { APP_URL } from 'lib/constants'
import FullLogo from 'lib/icons/full-logo.svg?react'
import Logo from 'lib/icons/logo.svg?react'
import OpenExternal from 'lib/icons/open-external.svg?react'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { getAccount } from 'lib/stores/user'

import { ChatListItem } from './ChatListItem'
import SidebarButton from './SidebarButton'

interface SidebarProps {
  onChatSelected: (chat: ChatApiResponse) => void
}

export function Sidebar({ onChatSelected = () => {} }: SidebarProps) {
  const { chats, currentChat, totalChats, chatsOffset, fetchChats } =
    useChatStore()
  const {
    state: { showOpenInFullButton, showPromptLibrary },
  } = useCustomizationStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(([entry]) => {
      const { clientHeight, scrollHeight } = entry.target
      if (clientHeight === scrollHeight && totalChats > chatsOffset)
        fetchChats()
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
      <div className='flex w-full flex-col gap-3 px-4'>
        <NewChatButton expanded className='h-10 w-full' />
        {showPromptLibrary && (
          <Button
            variant='ghost'
            className='justify-start px-3 no-underline data-[status=active]:bg-hover'
            asChild
          >
            <Link to='/prompts' search>
              <MessageSquarePlus className='h-4 w-4' />
              Prompt library
            </Link>
          </Button>
        )}
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
