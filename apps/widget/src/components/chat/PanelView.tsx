import { Check, ChevronDown, X } from 'lucide-react'
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { RenderType } from '@ns/public-api'
import { Button } from '@ns/ui/atoms/Button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ns/ui/atoms/Collapsible'
import { Spinner } from '@ns/ui/atoms/Spinner'
import { MessageMarkdown } from '@ns/ui/molecules/MessageMarkdown'
import { getMessageKey } from '@ns/ui/utils/getMessageKey'

import { type ChatMessage } from 'lib/models/message'
import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount } from 'lib/stores/user'

import { Message } from './messages/Message'

const PanelViewContext = createContext({
  activeInstructionId: '',
  activeinstructionName: '',
  isStreaming: false,
  loadingPanelMessages: false,
})

export function PanelView() {
  const {
    activeInstructionId,
    activeinstructionName,
    currentPanelMessages,
    loadingPanelMessages,
    setActiveInstructionId,
    setActiveinstructionName,
  } = usePanelChatStore()

  const { toggleRightPanel } = useLayoutStore()

  const instructionMessages = useMemo(() => {
    if (!activeInstructionId) return []
    return currentPanelMessages.filter(
      (message) => message.chat_id === activeInstructionId,
    )
  }, [currentPanelMessages, activeInstructionId])

  const progressMessages = useMemo(
    () =>
      instructionMessages.filter(
        (message) =>
          message.render_type === RenderType.TEMPORARY ||
          message.render_type === 'LOADING',
      ),
    [instructionMessages],
  )

  const thinkingMessages = useMemo(
    () =>
      instructionMessages.filter(
        (message) => message.render_type === RenderType.SOFT,
      ),
    [instructionMessages],
  )

  const chatMessages = useMemo(
    () =>
      instructionMessages.filter(
        (message) =>
          message.render_type === RenderType.STANDARD &&
          message.sending_agent !== 'user',
      ),
    [instructionMessages],
  )

  const isStreaming = useMemo(
    () =>
      instructionMessages.some(
        (message) => message.render_type === 'LOADING' || message.streaming,
      ),
    [instructionMessages],
  )

  const contextValue = {
    activeInstructionId: activeInstructionId || '',
    activeinstructionName: activeinstructionName || '',
    isStreaming,
    loadingPanelMessages,
  }

  const handleClose = () => {
    setActiveInstructionId('')
    setActiveinstructionName('')
    toggleRightPanel()
  }

  return (
    <PanelViewContext.Provider value={contextValue}>
      <div className='relative h-full'>
        <div className='flex h-full flex-col overflow-auto p-4'>
          <div className='flex justify-between'>
            <PanelHeader />
            <Button
              variant='ghost'
              size='sm'
              aria-label='Close'
              onClick={handleClose}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
          {((isStreaming || loadingPanelMessages) && !activeInstructionId) ||
          (thinkingMessages.length === 0 && chatMessages.length === 0) ? (
            <div className='flex h-full flex-col items-center justify-center p-6 text-neutral-400'>
              <Spinner size={1} />
            </div>
          ) : (
            <>
              {progressMessages.length + thinkingMessages.length > 0 && (
                <ThinkingSection
                  progressMessages={progressMessages}
                  thinkingMessages={thinkingMessages}
                  isStreaming={isStreaming}
                />
              )}
              <ResponseSection chatMessages={chatMessages} />
            </>
          )}
        </div>
      </div>
    </PanelViewContext.Provider>
  )
}

function PanelHeader() {
  const { viewportWidth } = useLayoutStore()
  const { activeinstructionName } = useContext(PanelViewContext)
  return (
    <MessageMarkdown
      accountName={getAccount()}
      viewportWidth={viewportWidth}
      className='mb-4 text-lg font-medium'
    >
      {activeinstructionName}
    </MessageMarkdown>
  )
}

function ThinkingSection({
  progressMessages,
  thinkingMessages,
  isStreaming,
}: {
  progressMessages: ChatMessage[]
  thinkingMessages: ChatMessage[]
  isStreaming: boolean
}) {
  const [thinkingOpen, setThinkingOpen] = useState(isStreaming)

  useEffect(() => setThinkingOpen(isStreaming), [isStreaming])

  return (
    <Collapsible open={thinkingOpen} onOpenChange={setThinkingOpen}>
      <ThinkingSectionHeader
        progressMessages={progressMessages}
        thinkingMessages={thinkingMessages}
      />
      <ThinkingSectionContent
        thinkingMessages={thinkingMessages}
        isStreaming={isStreaming}
      />
    </Collapsible>
  )
}

function ThinkingSectionHeader({
  progressMessages,
  thinkingMessages,
}: {
  progressMessages: ChatMessage[]
  thinkingMessages: ChatMessage[]
}) {
  const { viewportWidth } = useLayoutStore()
  return (
    <CollapsibleTrigger asChild>
      <button
        type='button'
        className='group/progress-messages mb-4 flex h-8 items-center gap-3 text-sm font-medium'
      >
        {progressMessages.length === 0 ? (
          <Check className='h-4 w-4' />
        ) : (
          <Spinner size={0.5} />
        )}
        {progressMessages.length === 0 ? (
          <span>Completed</span>
        ) : progressMessages[progressMessages.length - 1]?.markdown != null ? (
          <MessageMarkdown
            accountName={getAccount()}
            viewportWidth={viewportWidth}
          >
            {progressMessages[progressMessages.length - 1].markdown ?? ''}
          </MessageMarkdown>
        ) : (
          <span>Running</span>
        )}
        {thinkingMessages.length > 0 && (
          <ChevronDown className='h-4 w-4 transition group-aria-expanded/progress-messages:rotate-180' />
        )}
      </button>
    </CollapsibleTrigger>
  )
}

function ThinkingSectionContent({
  thinkingMessages,
  isStreaming,
}: {
  thinkingMessages: ChatMessage[]
  isStreaming: boolean
}) {
  const { viewportWidth } = useLayoutStore()
  return (
    <CollapsibleContent className='mb-6 mt-2.5 border-l-2 border-neutral-200 px-3'>
      {thinkingMessages.map((thinkingMessage, index, all) => (
        <Fragment key={thinkingMessage.id}>
          <div className='my-3'>
            <MessageMarkdown
              accountName={getAccount()}
              viewportWidth={viewportWidth}
              className='text-neutral-400'
            >
              {thinkingMessage.markdown ?? ''}
            </MessageMarkdown>
          </div>
          {index === all.length - 1 && isStreaming && (
            <div className='animate-pulse text-sm'>Thinking...</div>
          )}
        </Fragment>
      ))}
    </CollapsibleContent>
  )
}

function ResponseSection({ chatMessages }: { chatMessages: ChatMessage[] }) {
  return (
    <div className='flex-1'>
      {chatMessages.map((message) => (
        <Message
          message={message}
          key={getMessageKey(message)}
          isPopoverFeedbackChat={false}
        />
      ))}
    </div>
  )
}
