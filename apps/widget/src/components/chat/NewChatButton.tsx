import { useNavigate } from '@tanstack/react-router'
import React from 'react'

import { Button } from '@ns/ui/atoms/Button'
import { cn } from '@ns/ui/utils/cn'

import Add from 'lib/icons/add.svg?react'
import { useChatStore } from 'lib/stores/chat'
import { useLayoutStore } from 'lib/stores/layout'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  expanded: boolean
}

function NewChatButton({ className, expanded }: Props) {
  const { createNewChat } = useChatStore()
  const navigate = useNavigate()
  return (
    <Button
      onClick={() => {
        navigate({ to: '/chats', search: true })
        createNewChat()
        if (!useLayoutStore.getState().expanded) {
          useLayoutStore.getState().setShowSidebar(false)
        }
      }}
      variant={expanded ? 'outline' : 'ghost'}
      size={expanded ? 'default' : 'icon'}
      className={cn(
        'flex h-8 items-center gap-2 px-2 text-sm',
        expanded ? 'justify-start px-3' : 'justify-center',
        className,
      )}
    >
      <Add />
      {expanded ? 'New Chat' : null}
    </Button>
  )
}

export default NewChatButton
