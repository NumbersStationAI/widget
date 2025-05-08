import useSize from '@react-hook/size'
import { CircleAlert, InfoIcon } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Alert, AlertDescription } from '@ns/ui/atoms/Alert'
import { Spinner } from '@ns/ui/atoms/Spinner'
import { cn } from '@ns/ui/utils/cn'

import { Suggestions } from 'components/Suggestions'
import { type ChatMessage } from 'lib/models/message'
import { useChatStore } from 'lib/stores/chat'
import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { useUserStore } from 'lib/stores/user'

import MessageGroupView from './messages/MessageGroupView'

type MessageGroup = {
  userMessage: ChatMessage
  sender: 'user' | 'system'
  messages: ChatMessage[]
  streaming?: boolean
}

const THRESHOLD = 100

function getScrollTopMax(element: Element) {
  return element.scrollHeight - element.clientHeight
}

function equal(a: number, b: number) {
  return a - THRESHOLD <= b && b <= a + THRESHOLD
}

export default function MessageView() {
  const { currentChatMessages, loadingMessages, currentChat } = useChatStore()
  const { isFeedbackChat } = useUserStore()
  const { feedbackChatId } = usePanelChatStore()
  const { setViewportWidth } = useLayoutStore()
  const viewRef = useRef<HTMLDivElement>(null)
  const viewSize = useSize(viewRef)

  const messageGroups = useMemo(() => {
    const tempMessageGroups: MessageGroup[] = []
    let currentGroup: MessageGroup | null = null
    let currentUserMessage: ChatMessage
    currentChatMessages.forEach((message) => {
      const messageSender = message.sending_agent === 'user' ? 'user' : 'system'
      if (messageSender === 'user') {
        currentUserMessage = message
      }
      if (currentGroup === null || currentGroup.sender !== messageSender) {
        currentGroup = {
          sender: messageSender,
          messages: [],
          streaming: false,
          userMessage: currentUserMessage,
        }
        tempMessageGroups.push(currentGroup)
      }
      currentGroup.messages.push(message)
      currentGroup.streaming = currentGroup.streaming || message.streaming
    })
    return tempMessageGroups
  }, [currentChatMessages])

  useEffect(() => {
    setViewportWidth(viewSize[0])
  }, [setViewportWidth, viewSize])

  const [autoScroll, setAutoScroll] = useState(true)
  const isLastMessageUser =
    currentChatMessages.length > 0 &&
    currentChatMessages[currentChatMessages.length - 1].sending_agent === 'user'
  const isLastMessageLoading =
    currentChatMessages.length > 0 &&
    currentChatMessages[currentChatMessages.length - 1].render_type ===
      'LOADING'
  useLayoutEffect(() => {
    setAutoScroll((prev) => isLastMessageUser || isLastMessageLoading || prev)
  }, [isLastMessageUser, isLastMessageLoading])
  useLayoutEffect(() => {
    if (autoScroll) {
      const scrollId = requestAnimationFrame(() => {
        const el = viewRef.current
        if (el) el.scrollTop = getScrollTopMax(el)
      })
      return () => cancelAnimationFrame(scrollId)
    }
  })
  const selectedChatIndices = useMemo(() => {
    const chatIndices = []
    if (feedbackChatId !== null) {
      const systemGroupIndex = messageGroups.findIndex((group) =>
        group.messages.some(
          (message) => message.feedback_chat_id === feedbackChatId,
        ),
      )
      chatIndices.push(systemGroupIndex, systemGroupIndex - 1)
    }
    return chatIndices
  }, [messageGroups, feedbackChatId])

  return (
    <div
      ref={viewRef}
      onScroll={() => {
        const el = viewRef.current
        if (el) setAutoScroll(equal(el.scrollTop, getScrollTopMax(el)))
      }}
      className='relative flex min-h-[2rem] w-full flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-4'
    >
      {loadingMessages ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex w-[53rem] min-w-[15rem] max-w-full flex-col py-2 pb-14'>
          {currentChatMessages.length === 0 ? (
            <>
              {isFeedbackChat ? (
                <Alert className='mt-8 flex border border-neutral-200 bg-neutral-100'>
                  <InfoIcon className='mr-1 h-4 w-4' />
                  <AlertDescription className='text-xs'>
                    Please continue in the chat to provide corrections to the
                    negative feedback. Click ‘Save as Feedback’ once satisfied
                    with the correct answer.
                  </AlertDescription>
                </Alert>
              ) : (
                <Suggestions className='sm:mt-10' />
              )}
            </>
          ) : (
            <>
              {isFeedbackChat && (
                <div className='-mb-2 mr-8 mt-4 flex items-center justify-end gap-2'>
                  <CircleAlert size={14} className='text-blue-500' />
                  <span className='text-xs font-medium text-blue-600'>
                    Rephrased question:
                  </span>
                </div>
              )}
              {messageGroups.map((messageGroup, groupIndex) => {
                const isFeedbackGroup =
                  feedbackChatId && selectedChatIndices.includes(groupIndex)
                const shouldGrayOut =
                  isFeedbackChat &&
                  currentChat?.is_valid === false &&
                  groupIndex > 0
                return (
                  <MessageGroupView
                    key={`${currentChat?.id}-${groupIndex}`}
                    messages={messageGroup.messages}
                    sender={messageGroup.sender}
                    isStreaming={messageGroup.streaming}
                    userMessage={messageGroup.userMessage}
                    isPopoverFeedbackChat={false}
                    className={cn(
                      feedbackChatId &&
                        !isFeedbackGroup &&
                        'pointer-events-none opacity-50 grayscale filter',
                      shouldGrayOut &&
                        'pointer-events-none opacity-50 grayscale filter',
                    )}
                  />
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
