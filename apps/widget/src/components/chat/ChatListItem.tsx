import { useLocation, useNavigate } from '@tanstack/react-router'
import { Ellipsis } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { type ChatApiResponse } from '@ns/public-api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ns/ui/atoms/DropdownMenu'
import { cn } from '@ns/ui/utils/cn'

import { useChatStore } from 'lib/stores/chat'

interface ChatListItemProps {
  chat: ChatApiResponse
  index: number
  onChatSelected: (chat: ChatApiResponse) => void
}

export function ChatListItem({
  chat,
  index,
  onChatSelected,
}: ChatListItemProps) {
  const { currentChat, setCurrentChat, deleteChat, updateChat, cloneChat } =
    useChatStore()
  const [open, setOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(chat.name ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLLIElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      const { length } = inputRef.current.value
      inputRef.current.setSelectionRange(length, length)
    }
  }, [isRenaming])

  const handleRename = async () => {
    if (!isRenaming) return

    if (!newName.trim() || newName === chat.name) {
      setNewName(chat.name ?? '')
    } else {
      try {
        await updateChat(chat.id, { ...chat, name: newName.trim() })
      } catch (error) {
        setNewName(chat.name ?? '')
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

  const isChatActive =
    (currentChat?.id === chat.id && location.pathname === '/chats') || open

  return (
    <li
      ref={containerRef}
      key={index}
      className={cn(
        'group relative flex h-9 items-center justify-between rounded-md pl-3 text-left font-medium hover:bg-hover',
        isChatActive && 'bg-hover',
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
              setNewName(chat.name ?? '')
            }
          }}
          className='h-full w-full bg-transparent px-0 text-sm focus:outline-none'
        />
      ) : (
        <button
          type='button'
          className='relative h-full grow overflow-hidden whitespace-nowrap text-start text-sm'
          onClick={() => {
            setCurrentChat(chat)
            onChatSelected(chat)
            navigate({ to: '/chats', search: true })
          }}
        >
          <div
            className={cn(
              'bg-gradient-to-r from-80% to-95% bg-clip-text text-transparent',
              isChatActive || isRenaming
                ? 'from-neutral-900'
                : 'from-neutral-600',
            )}
          >
            {chat.name}
          </div>
        </button>
      )}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={cn(
            'flex min-h-6 items-center justify-center rounded-md bg-white',
            open
              ? 'mr-2 w-6'
              : 'w-0 group-hover:mr-2 group-hover:w-6 group-hover:min-w-6',
          )}
        >
          <Ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-64' align='start'>
          <DropdownMenuItem
            onClick={() => {
              setNewName(chat.name ?? '')
              setIsRenaming(true)
              setOpen(false)
            }}
            onPointerLeave={(e) => {
              if (!open) e.preventDefault()
            }}
            onPointerMove={(e) => {
              if (!open) e.preventDefault()
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              cloneChat(chat.id)
            }}
          >
            Clone
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => deleteChat(chat.id)}>
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className='px-2 py-1.5 text-xs text-neutral-400'>
            <p>Last edited by {chat.creator.name}</p>
            <p>
              {new Date(chat.last_modified_at).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
