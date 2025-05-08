import { CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useGetChat } from '@ns/public-api'
import { Spinner } from '@ns/ui/atoms/Spinner'
import { cn } from '@ns/ui/utils/cn'

import { type ChatMessage } from 'lib/models/message'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount } from 'lib/stores/user'

import MessageGroupView from '../messages/MessageGroupView'

interface MessageGroup {
  userMessage: ChatMessage
  sender: 'user' | 'system'
  messages: ChatMessage[]
  streaming?: boolean
}

interface FeedbackViewProps {
  feedbackChatId: string | null
}

export function FeedbackChatView({ feedbackChatId }: FeedbackViewProps) {
  const { currentPanelMessages, loadingPanelMessages, setFeedbackChatId } =
    usePanelChatStore()
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([])
  const viewRef = useRef<HTMLDivElement>(null)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data } = useGetChat({
    accountName: getAccount(),
    chatId: feedbackChatId as string,
  })

  const isLastMessageUser = useCallback((): boolean => {
    return (
      currentPanelMessages.length > 0 &&
      currentPanelMessages[currentPanelMessages.length - 1].sending_agent ===
        'user'
    )
  }, [currentPanelMessages])

  const isLastMessageLoading = useCallback((): boolean => {
    return (
      currentPanelMessages.length > 0 &&
      currentPanelMessages[currentPanelMessages.length - 1].render_type ===
        'LOADING'
    )
  }, [currentPanelMessages])
  const scrollToBottom = useCallback((immediate = false) => {
    if (!messagesEndRef.current) return
    messagesEndRef.current.scrollIntoView({
      behavior: immediate ? 'auto' : 'smooth',
    })
  }, [])
  const handleScroll = useCallback(() => {
    if (!viewRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = viewRef.current
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10
    setIsAutoScrollEnabled(isAtBottom)
  }, [])
  useEffect(() => {
    if (feedbackChatId !== usePanelChatStore.getState().feedbackChatId) {
      setFeedbackChatId(feedbackChatId)
    }
  }, [feedbackChatId, setFeedbackChatId])
  useEffect(() => {
    const tempMessageGroups: MessageGroup[] = []
    let currentGroup: MessageGroup | null = null
    let currentUserMessage: ChatMessage
    currentPanelMessages.forEach((message) => {
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

    setMessageGroups([...tempMessageGroups])
  }, [currentPanelMessages])
  useEffect(() => {
    if (isLastMessageUser() || isLastMessageLoading() || isAutoScrollEnabled) {
      scrollToBottom(true)
      const observer = new ResizeObserver(() => {
        if (isAutoScrollEnabled) {
          const timeoutId = setTimeout(() => {
            scrollToBottom()
          }, 100)
          return () => clearTimeout(timeoutId)
        }
      })

      if (viewRef.current) {
        observer.observe(viewRef.current)
      }
      return () => {
        observer.disconnect()
      }
    }
  }, [
    currentPanelMessages,
    isLastMessageUser,
    isLastMessageLoading,
    isAutoScrollEnabled,
    scrollToBottom,
  ])
  return (
    <div
      ref={viewRef}
      onScroll={handleScroll}
      className='relative flex min-h-[2rem] w-full flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-4'
    >
      {loadingPanelMessages ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex h-full w-[53rem] min-w-[15rem] max-w-full flex-col py-2'>
          {!currentPanelMessages.length ? (
            <div className='p-4'>No messages found in this chat.</div>
          ) : (
            <>
              <div className='mr-8 mt-4 flex items-center justify-end gap-2'>
                <CircleAlert size={14} className='text-blue-500' />
                <span className='text-xs font-medium text-blue-600'>
                  Rephrased question:
                </span>
              </div>
              {messageGroups.map((messageGroup, groupIndex) => (
                <MessageGroupView
                  key={`${feedbackChatId}-${groupIndex}`}
                  messages={messageGroup.messages}
                  sender={messageGroup.sender}
                  isStreaming={messageGroup.streaming}
                  userMessage={messageGroup.userMessage}
                  isPopoverFeedbackChat
                  className={cn(
                    !data?.is_valid &&
                      groupIndex > 0 &&
                      'pointer-events-none opacity-50 grayscale filter',
                  )}
                />
              ))}
            </>
          )}
          <div ref={messagesEndRef} className='h-[80px] w-full' />
        </div>
      )}
    </div>
  )
}
