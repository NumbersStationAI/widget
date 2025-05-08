import { useNavigate, useSearch } from '@tanstack/react-router'
import { Atom, AtSign, Hash, Paperclip } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { sendInterrupt } from '@ns/public-api'
import { Button, TooltipButton } from '@ns/ui/atoms/Button'
import {
  MessageRichTextInput,
  MessageRichTextInputContent,
  MessageRichTextInputEnterKeyPlugin,
  MessageRichTextInputMentionsPlugin,
} from '@ns/ui/molecules/MessageRichTextInput'
import { cn } from '@ns/ui/utils/cn'
import {
  AGENT_TRIGGER,
  ASSET_TRIGGER,
  useMentionItems,
} from '@ns/ui/utils/mentions'

import { useChatStore } from 'lib/stores/chat'
import {
  useCustomizationStore,
  useEnabledAgentNames,
} from 'lib/stores/customization'
import { getAccount, useUserStore } from 'lib/stores/user'

import SendButton from '../SendButton'

import { MentionButton } from './MentionButton'

export default function ChatInput() {
  const { isFeedbackChat } = useUserStore()
  const {
    inputValue,
    setInputValue,
    inputState,
    currentChat,
    currentChatMessages,
    sendMessage,
    removeLoadingMessage,
    isReadOnlyChat,
  } = useChatStore()
  const {
    state: { showAttachFileButton, showDeepResearchButton, showAgentTagging },
  } = useCustomizationStore()

  const [file, setFile] = useState<File>()

  const navigate = useNavigate({ from: '/chats' })
  const setDeepResearch = (deepResearch: boolean) =>
    navigate({ search: (prev) => ({ ...prev, deepResearch }) })
  const { deepResearch } = useSearch({ from: '/_widget/chats' })

  const handleInterrupt = useCallback(async () => {
    if (!currentChat) return
    await sendInterrupt({ accountName: getAccount(), chatId: currentChat.id })
    removeLoadingMessage(currentChat.id)
  }, [removeLoadingMessage, currentChat])

  const handleSend = useCallback(async () => {
    setInputValue('')
    sendMessage(inputValue, deepResearch, file)
    setFile(undefined)
  }, [
    sendMessage,
    deepResearch,
    file,
    setFile,
    inputValue,
    setInputValue,
    setDeepResearch,
  ])

  const handleSubmit = useCallback(
    (keyboardCommand = false) => {
      const currentChatId = useChatStore.getState().currentChat?.id
      const currentInputState = useChatStore
        .getState()
        .inputState.get(currentChatId || '')
      switch (currentInputState) {
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

  const enabledAgentNames = useEnabledAgentNames()
  const mentionItems = useMentionItems({
    accountName: getAccount(),
    enabledAgentNames: showAgentTagging ? enabledAgentNames : undefined,
  })

  return (
    <MessageRichTextInput
      readOnly={isReadOnlyChat}
      value={inputValue}
      onValueChange={setInputValue}
    >
      <div className='flex w-[53rem] min-w-[15rem] max-w-full flex-col rounded-xl border bg-white'>
        <div className='h-fit w-full py-3 pl-4 pr-3'>
          <MessageRichTextInputContent
            placeholder={
              isReadOnlyChat
                ? 'This chat is read-only.'
                : currentChatMessages.length === 0
                  ? 'What would you like to achieve today?'
                  : 'Ask a follow-up question'
            }
          />
          {!isFeedbackChat && (
            <MessageRichTextInputMentionsPlugin items={mentionItems} />
          )}
          <MessageRichTextInputEnterKeyPlugin
            onEnterKeyPressed={() => handleSubmit(true)}
          />
        </div>
        <div className='flex items-center justify-between p-3'>
          <div className='flex items-center gap-2'>
            {showAgentTagging && (
              <MentionButton
                label='Mention AI agent'
                trigger={AGENT_TRIGGER}
                icon={AtSign}
                disabled={isReadOnlyChat}
              />
            )}
            {!isFeedbackChat && (
              <MentionButton
                label='Reference data asset'
                trigger={ASSET_TRIGGER}
                icon={Hash}
                disabled={isReadOnlyChat}
              />
            )}
            {showAttachFileButton && (
              <AttachFileButton value={file} onValueChange={setFile} />
            )}
            {!isFeedbackChat && showDeepResearchButton && (
              <DeepResearchButton
                value={deepResearch ?? false}
                onValueChange={setDeepResearch}
              />
            )}
          </div>
          <SendButton
            state={inputState.get(currentChat?.id || '') ?? 'send'}
            onSubmit={() => handleSubmit(false)}
          />
        </div>
      </div>
    </MessageRichTextInput>
  )
}

function DeepResearchButton({
  value,
  onValueChange,
}: {
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <Button
      variant='outline'
      className={cn(
        'group/deep-research-button h-8 gap-1.5 rounded-full pl-2 pr-1 transition-colors',
        value &&
          'border-indigo-500 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600',
      )}
      onClick={() => onValueChange(!value)}
    >
      <Atom className='h-4 w-4' />
      Deep research
      <span
        className={cn(
          'flex h-6 items-center justify-center rounded-full bg-neutral-100 px-2.5 text-xs font-medium text-neutral-900 transition-colors group-hover/deep-research-button:bg-neutral-200',
          value &&
            'bg-indigo-100 text-indigo-600 group-hover/deep-research-button:bg-indigo-200 group-hover/deep-research-button:text-indigo-700',
        )}
      >
        Beta
      </span>
    </Button>
  )
}

function AttachFileButton({
  value,
  onValueChange,
}: {
  value: File | undefined
  onValueChange: (value: File | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <TooltipButton
        variant='outline'
        onClick={() => inputRef.current?.click()}
        tooltip='Attach CSV file'
        className={cn(
          'h-8 rounded-full',
          value
            ? 'border-indigo-500 bg-indigo-50 px-2 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600'
            : 'w-8 p-0',
        )}
      >
        <Paperclip className='h-4 w-4' />
        {value?.name}
      </TooltipButton>
      <input
        ref={inputRef}
        type='file'
        name='file'
        className='hidden'
        onChange={(event) => onValueChange(event.currentTarget.files?.[0])}
        accept='.csv'
      />
    </>
  )
}
