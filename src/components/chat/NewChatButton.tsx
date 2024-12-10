import React from 'react'
import { ReactComponent as Add } from 'lib/icons/add.svg'
import { Button } from 'components/Button'
import { cn } from 'lib/utils'
import { useChatStore } from 'lib/stores/chat'
import { $getRoot } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLayoutStore } from 'lib/stores/layout'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  expanded: boolean
}

const NewChatButton: React.FC<Props> = ({ className, onSubmit, expanded }) => {
  const { setCurrentChatId } = useChatStore()
  const [editor] = useLexicalComposerContext()

  return (
    <Button
      onClick={() => {
        setCurrentChatId('')
        if (!useLayoutStore.getState().expanded) {
          useLayoutStore.getState().setShowSidebar(false)
        }
        editor.update(() => {
          const root = $getRoot()
          root.clear()
        })
      }}
      variant={expanded ? 'outline' : 'ghost'}
      size={expanded ? 'default' : 'icon'}
      className={cn(
        `flex items-center gap-2 ${expanded ? 'justify-start' : 'justify-center'} h-8 px-2 text-sm`,
        className,
      )}
    >
      <Add />
      {expanded ? 'New Chat' : null}
    </Button>
  )
}

export default NewChatButton
