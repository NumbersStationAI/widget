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
      className={`relative h-9 px-3 ${
        currentChatId === chat.id || open
          ? 'bg-[hsl(var(--primary)/0.06)] text-foreground'
          : 'text-foreground/75'
      } group flex items-center justify-between rounded-md text-left font-medium hover:bg-primary/10`}
    >
      <button
        className={`h-full flex-1 text-start text-sm`}
        onClick={() => {
          setCurrentChatId(chat.id)
          onChatSelected(chat)
        }}
      >
        <p className='line-clamp-1 overflow-hidden'>{chat.name}</p>
      </button>
      <DropdownMenu open={open} onOpenChange={(value) => setOpen(value)}>
        <DropdownMenuTrigger
          className={`flex min-h-6 items-center justify-center rounded-md bg-white ${open ? 'w-6' : 'w-0'} group-hover:w-6 group-hover:min-w-6`}
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
