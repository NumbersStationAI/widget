import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/Dropdown'
import { Chat } from 'lib/models/chat'
import { useChatStore } from 'lib/stores/chat'
import { cn } from 'lib/utils'
import { Ellipsis } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatListItemProps {
  chat: Chat
  index: number
  onChatSelected: (chat: Chat) => void
}

export function ChatListItem({
  chat,
  index,
  onChatSelected,
}: ChatListItemProps) {
  const { currentChat, setCurrentChat, deleteChat, updateChat, cloneChat } = useChatStore()
  const [open, setOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(chat.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }, [isRenaming])

  const handleRename = async () => {
    if (!isRenaming) return

    if (!newName.trim() || newName === chat.name) {
      setNewName(chat.name)
    } else {
      try {
        await updateChat(chat.id, { ...chat, name: newName.trim() })
      } catch (error) {
        setNewName(chat.name)
      }
    }
    setIsRenaming(false)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      requestAnimationFrame(() => {
        if (isRenaming && inputRef.current) {
          inputRef.current.focus()
        }
      })
      return
    }
    handleRename()
  }

  return (
    <li
      ref={containerRef}
      key={index}
      className={cn(
        "relative h-9 pl-3 group flex items-center justify-between rounded-md text-left font-medium hover:bg-hover",
        {
          "bg-hover": currentChat?.id === chat.id || open
        }
      )}
      onMouseDown={(e) => {
        if (isRenaming) {
          e.preventDefault()
        }
      }}
    >
      {isRenaming ? (
        <input
          ref={inputRef}
          type='text'
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleRename()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setIsRenaming(false)
              setNewName(chat.name)
            }
          }}
          className='h-full w-full bg-transparent px-0 text-sm focus:outline-none'
        />
      ) : (
        <button
          className='relative h-full grow overflow-hidden whitespace-nowrap text-start text-sm'
          onClick={() => {
            setCurrentChat(chat)
            onChatSelected(chat)
          }}
        >
          <div className={`bg-gradient-to-r ${currentChat?.id === chat.id || open || isRenaming ? 'from-neutral-900' : 'from-neutral-600'
            }  from-80% to-95% text-transparent bg-clip-text`}>
            {chat.name}
          </div>
        </button>
      )}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={cn(
            'flex min-h-6 items-center justify-center rounded-md bg-white',
            open ? 'w-6 mr-2' : 'w-0 group-hover:mr-2 group-hover:w-6 group-hover:min-w-6'
          )}
        >
          <Ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setNewName(chat.name)
              setIsRenaming(true)
              setOpen(false)
            }}
            onPointerLeave={(e) => { if (!open) e.preventDefault() }}
            onPointerMove={(e) => { if (!open) e.preventDefault() }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteChat(chat.id)}>
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              cloneChat(chat.id)
            }}
          >
            Clone
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}