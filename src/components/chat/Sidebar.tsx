import NewChatButton from 'components/chat/NewChatButton'
import { Button, TooltipButton } from 'components/Button'
import { ReactComponent as OpenExternal } from 'lib/icons/open-external.svg'
import { ReactComponent as FullLogo } from 'lib/icons/full-logo.svg'
import { ReactComponent as Logo } from 'lib/icons/logo.svg'

import { useState } from 'react'
import { Ellipsis, Menu } from 'lucide-react'
import { Chat } from 'lib/models/chat'
import { useChatStore } from 'lib/stores/chat'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/Dropdown'
import SidebarButton from './SidebarButton'
import { getAccount, useUserStore } from 'lib/stores/user'
import { APP_URL } from 'lib/constants'
import ChatListItem from './ChatListItem'

interface Props {
  onChatSelected: (chat: Chat) => void
}

const Sidebar: React.FC<Props> = ({ onChatSelected = () => {} }) => {
  const { chats, currentChatId, setCurrentChatId, deleteChat } = useChatStore()
  const { user } = useUserStore()

  return (
    <div className='group/sidebar flex h-screen max-h-screen w-[75vw] flex-col gap-4 bg-white pb-1 transition-all md:w-full'>
      <div className='flex h-[3.5rem] w-full flex-row items-center justify-start gap-2 px-4'>
        <Logo width='20' height='20' className='flex-shrink-0' />
        <h1 className='line-clamp-1 overflow-hidden text-sm font-semibold'>
          Analytics Copilot
        </h1>
        <div className='flex-1' />
        <div className='opacity-0 transition-opacity group-hover/sidebar:opacity-100'>
          <SidebarButton />
        </div>
      </div>
      <div className='w-full px-4'>
        <NewChatButton expanded className='h-10 w-full' />
      </div>
      <div className='flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2'>
        <h2 className='px-3 text-xs font-medium'>Recent</h2>
        <ul className='flex flex-col gap-2'>
          {chats.map((chat, index) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              index={index}
              onChatSelected={onChatSelected}
            />
          ))}
        </ul>
      </div>
      <div className='h-fit px-4'>
        <a
          href={`${APP_URL}/${getAccount()}/chats/${currentChatId}`}
          target='_blank'
          rel='noreferrer'
          className='!no-underline'
        >
          <Button
            variant={'ghost'}
            className='flex w-full items-center justify-start gap-2 px-3 text-sm'
          >
            <OpenExternal />
            Open full app
          </Button>
        </a>
        <div className='mx-4 mb-4 mt-3 flex gap-2 whitespace-nowrap text-[0.6rem] text-foreground/50'>
          Powered by <FullLogo />
        </div>
      </div>
    </div>
  )
}

export default Sidebar
