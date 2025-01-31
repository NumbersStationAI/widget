import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND,
} from 'lexical'
import {
  BeautifulMentionsPlugin,
  useBeautifulMentions,
} from 'lexical-beautiful-mentions'
import { API_URL } from 'lib/constants'
import { clearContent, getContent, useChatStore } from 'lib/stores/chat'
import { useDatasetStore } from 'lib/stores/datasets'
import { getAccount } from 'lib/stores/user'
import { getAuthHeaders } from 'lib/utils/token'
import { useCallback, useEffect, useReducer, useState } from 'react'
import SendButton from '../SendButton'
import ChatInputToolbar from './ChatInputToolbar'
import MentionsBar from './MentionsBar'
import { MentionsMenu, MentionsMenuItem } from './MentionsMenu'

const ChatInput: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const setChatEditor = useChatStore((state) => state.setChatEditor)
  const {
    inputState,
    updateDisabledState,
    currentChat,
    currentChatMessages,
    sendMessage,
    removeLoadingMessage,
    isReadOnlyChat,
  } = useChatStore()
  editor.setEditable(!isReadOnlyChat)

  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const [mentionItems, setMentionItems] = useState<Record<string, any>>({
    '@': [],
  })
  const { datasets } = useDatasetStore()
  const { getMentions } = useBeautifulMentions()

  const handleInterrupt = useCallback(async () => {
    if (!currentChat) return
    await fetch(
      `${API_URL}/v3/orgs/${getAccount()}/chat/${currentChat.id}/interrupt`,
      {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      },
    )
    removeLoadingMessage(currentChat.id)
  }, [removeLoadingMessage, currentChat])

  const handleSend = useCallback(async () => {
    let content = getContent()
    useDatasetStore.getState().datasets
      .sort((a, b) => b.name.length - a.name.length)
      .forEach((dataset) => {
        content = content.split(`@${dataset.name}`).join(`@[${dataset.name}](ds-${dataset.id})`)
      })
    clearContent()

    sendMessage(content)
  }, [sendMessage])

  const handleSubmit = useCallback(
    (keyboardCommand = false) => {
      const currentChatId = useChatStore.getState().currentChat?.id
      const inputState = useChatStore.getState().inputState.get(currentChatId || '')
      switch (inputState) {
        case 'send':
          handleSend()
          break
        case 'interrupt':
          if (!keyboardCommand) {
            handleInterrupt()
          }
          break
        default:
          break
      }
    },
    [handleInterrupt, handleSend],
  )

  useEffect(() => {
    setChatEditor(editor)
    updateDisabledState(useChatStore.getState().currentChat?.id || '')
    editor.registerCommand<KeyboardEvent | null>(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        if (event !== null) {
          event.preventDefault()
          if (event.shiftKey) {
            return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
          }
        }
        handleSubmit(true)
        return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
      },
      COMMAND_PRIORITY_LOW,
    )

    editor.registerTextContentListener(() => {
      updateDisabledState(useChatStore.getState().currentChat?.id || '')
      const newMentions = useDatasetStore
        .getState()
        .datasets.filter(
          (dataset) =>
            !getMentions().some((mention) => mention.data?.id === dataset.id),
        )
        .map((dataset) => ({
          label: dataset.name,
          id: dataset.id,
          value: `${dataset.name}`,
          type: dataset.asset_type,
          connection_type: dataset.connection_type,
        }))

      if (newMentions.length > 0) {
        setMentionItems({
          '@': newMentions,
        })
      } else {
        setMentionItems({})
      }
      forceUpdate()
    })
  }, [editor, getMentions, handleSubmit, setChatEditor, updateDisabledState])

  useEffect(() => {
    setMentionItems({
      '@': datasets.map((dataset) => ({
        label: dataset.name,
        id: dataset.id,
        value: `${dataset.name}`,
        type: dataset.asset_type,
        connection_type: dataset.connection_type,
      })),
    })
    forceUpdate()
  }, [datasets])

  return (
    <div className='mr-3 flex w-[53rem] min-w-[15rem] max-w-full flex-col items-center rounded-lg border border-border bg-white px-3 py-2'>
      <MentionsBar />
      <BeautifulMentionsPlugin
        items={mentionItems}
        menuComponent={MentionsMenu}
        menuItemComponent={MentionsMenuItem}
        autoSpace={false}
        menuItemLimit={false}
        insertOnBlur={false}
        showCurrentMentionsAsSuggestions={false}
      />

      <div className='flex w-full flex-row items-end justify-between gap-2'>
        <div className='relative h-fit w-full min-w-[10rem]'>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                placeholder={
                  <div className='pointer-events-none absolute left-0 top-0 w-full select-none overflow-hidden overflow-ellipsis whitespace-nowrap text-foreground/50'>
                    {isReadOnlyChat ? 'This chat is read-only.' :
                      currentChatMessages.length === 0
                        ? 'Ask your data a question. Reference datasets with @'
                        : 'Ask a follow-up question'}
                  </div>
                }
                aria-placeholder='Ask your data a question. Reference datasets with @'
                className='relative max-h-[14rem] min-h-7 w-full resize-none overflow-y-auto leading-6 outline-0 focus-visible:outline-none'
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <AutoFocusPlugin />
        </div>

        <div className='flex h-full items-end gap-2'>
          <ChatInputToolbar currentMentions={mentionItems['@']} disabled={isReadOnlyChat} />
          <SendButton
            state={inputState.get(currentChat?.id || '') ?? 'send'}
            onSubmit={() => handleSubmit(false)}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatInput
