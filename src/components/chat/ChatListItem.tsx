import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/Dropdown'
import { Chat } from 'lib/models/chat'
import { useChatStore } from 'lib/stores/chat'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'

interface ChatListItemProps {
  chat: Chat
  index: number
  onChatSelected: (chat: Chat) => void
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  index,
  onChatSelected,
}) => {
  const { currentChatId, setCurrentChatId, deleteChat } = useChatStore()
  const [open, setOpen] = useState(false)

  return (
    <li
      key={index}
      className={`relative h-9 pl-3 ${
        currentChatId === chat.id || open
          ? 'bg-hover text-foreground'
          : 'text-foreground/75'
      } group flex items-center justify-between rounded-md text-left font-medium hover:bg-hover`}
    >
      <button
        className={`relative h-full grow overflow-hidden whitespace-nowrap text-start text-sm`}
        onClick={() => {
          setCurrentChatId(chat.id)
          onChatSelected(chat)
        }}
      >
        {chat.name}
        <div className='absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l from-white from-0% to-transparent group-hover:from-hover'></div>
      </button>
      <DropdownMenu open={open} onOpenChange={(value) => setOpen(value)}>
        <DropdownMenuTrigger
          className={`flex min-h-6 items-center justify-center rounded-md bg-white ${open ? 'w-6' : 'w-0'} group-hover:mr-2 group-hover:w-6 group-hover:min-w-6`}
        >
          <Ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              deleteChat(chat.id)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

export default ChatListItem
