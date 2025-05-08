import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  ContentEditable,
  type ContentEditableProps,
} from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  type EditorState,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND,
  type LexicalNode,
} from 'lexical'
import {
  $isBeautifulMentionNode,
  BeautifulMentionNode,
  type BeautifulMentionsMenuItemProps,
  type BeautifulMentionsMenuProps,
  BeautifulMentionsPlugin,
} from 'lexical-beautiful-mentions'
import { forwardRef, useCallback, useEffect, useMemo } from 'react'

import { cn } from '../utils/cn'
import {
  $convertToMentionNodes,
  AGENT_TRIGGER,
  ASSET_TRIGGER,
  isAgentMentionIdentifier,
  isAssetMentionIdentifier,
  type MentionData,
  type useMentionItems,
} from '../utils/mentions'

import { MentionsMenu, MentionsMenuItem } from './MentionsMenu'

function getTextContent(node: LexicalNode) {
  let result = ''
  if ($isElementNode(node)) {
    const children = node.getChildren()
    children.forEach((child) => {
      result += getTextContent(child)
    })
  } else if ($isBeautifulMentionNode(node)) {
    const data = node.getData()
    if (isAssetMentionIdentifier(data)) {
      result += `${ASSET_TRIGGER}[${data.name}](ds-${data.short_id})`
    } else if (isAgentMentionIdentifier(data)) {
      result += `${AGENT_TRIGGER}[${data.name}](agent-${data.agent_name})`
    } else {
      throw new Error('Invalid mention found!')
    }
  } else {
    result += node.getTextContent()
  }
  return result
}

function setEditorState(value?: string | null) {
  return () => {
    const root = $getRoot()
    if (value != null && value !== getTextContent(root)) {
      const paragraph = $createParagraphNode()
      paragraph.append(
        ...$convertToMentionNodes(value, [ASSET_TRIGGER, AGENT_TRIGGER], ''),
      )
      root.clear()
      root.append(paragraph)
      paragraph.selectEnd()
    }
  }
}

export type MessageRichTextInputProps = {
  readOnly?: boolean
  value?: string | null
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

export function MessageRichTextInput({
  readOnly,
  value,
  onValueChange,
  children,
}: MessageRichTextInputProps) {
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: '',
      editable: !readOnly,
      theme: {
        beautifulMentions: {
          [AGENT_TRIGGER]: 'bg-indigo-50 text-indigo-500 w-fit px-1 rounded-sm',
          [`${AGENT_TRIGGER}Focused`]:
            'shadow-md outline-2 outline outline-indigo-500',
          [ASSET_TRIGGER]: 'bg-blue-50 text-blue-500 w-fit px-1 rounded-sm',
          [`${ASSET_TRIGGER}Focused`]:
            'shadow-md outline-2 outline outline-blue-500',
        },
      },
      onError: (error) => {
        throw error
      },
      nodes: [BeautifulMentionNode],
      editorState: setEditorState(value),
    }),
    [value, readOnly],
  )
  const onChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot()
        onValueChange?.(getTextContent(root))
      })
    },
    [onValueChange],
  )
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {children}
      <ReadOnlyPlugin readOnly={readOnly} />
      <ValuePlugin value={value} />
      <OnChangePlugin onChange={onChange} />
      <AutoFocusPlugin />
    </LexicalComposer>
  )
}

export type MessageRichTextInputContentProps = Omit<
  ContentEditableProps,
  'placeholder' | keyof MessageRichTextInputProps
> & { placeholder?: string }

export function MessageRichTextInputContent({
  disabled,
  placeholder = 'Enter your message',
  className,
  ...props
}: MessageRichTextInputContentProps) {
  const [editor] = useLexicalComposerContext()
  const readOnly = !editor.isEditable()
  return (
    <div className='relative min-h-full min-w-full'>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={cn(
              'min-h-5 outline-none',
              disabled && 'pointer-events-none',
              className,
            )}
            placeholder={
              <div className='pointer-events-none absolute left-0 top-0 w-full select-none truncate text-neutral-400'>
                {placeholder}
              </div>
            }
            aria-placeholder={placeholder}
            disabled={disabled}
            aria-disabled={disabled}
            readOnly={readOnly}
            aria-readonly={readOnly}
            {...props}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  )
}

function ReadOnlyPlugin({ readOnly }: { readOnly?: boolean }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    editor.setEditable(!readOnly)
  }, [editor, readOnly])
  return null
}

function ValuePlugin({ value }: { value?: string | null }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    editor.update(setEditorState(value))
  }, [editor, value])
  return null
}

export function MessageRichTextInputMentionsPlugin({
  items,
}: {
  items: ReturnType<typeof useMentionItems>
}) {
  return (
    <BeautifulMentionsPlugin
      items={items}
      menuComponent={MenuComponent}
      menuItemComponent={MenuItemComponent}
      menuItemLimit={false}
    />
  )
}

const MenuComponent = forwardRef<HTMLUListElement, BeautifulMentionsMenuProps>(
  (props, ref) => (
    <div className='absolute bottom-0 h-[200%]'>
      <div className='absolute top-0'>
        <MentionsMenu
          className='absolute bottom-2.5 z-50'
          ref={ref}
          {...props}
        />
      </div>
    </div>
  ),
)

const MenuItemComponent = forwardRef<
  HTMLLIElement,
  BeautifulMentionsMenuItemProps
>(({ item, itemValue, label, selected, ...props }, ref) => (
  <MentionsMenuItem
    item={item.data as MentionData}
    selected={selected}
    ref={ref}
    {...props}
  />
))

export function MessageRichTextInputEnterKeyPlugin({
  onEnterKeyPressed,
}: {
  onEnterKeyPressed: () => void
}) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerCommand<KeyboardEvent | null>(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        if (event != null) {
          event.preventDefault()
          if (event.shiftKey) {
            return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
          }
        }
        onEnterKeyPressed()
        return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, onEnterKeyPressed])
  return null
}
