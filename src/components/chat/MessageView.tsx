import useSize from '@react-hook/size'
import Spinner from 'components/Spinner'
import { ChatMessage } from 'lib/models/message'
import { useChatStore } from 'lib/stores/chat'
import { useLayoutStore } from 'lib/stores/layout'
import { useUserStore } from 'lib/stores/user'
import { cn } from 'lib/utils'
import { CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import MessageGroup from './messages/MessageGroupView'
import OnboardingMessage from './messages/OnboardingMessage'

interface MessageGroup {
  userMessage: ChatMessage
  sender: 'user' | 'system'
  messages: ChatMessage[]
  streaming?: boolean
}
const MessageView: React.FC = () => {
  const { currentChatMessages, loadingMessages, currentChat } = useChatStore()
  const { rightPanelOpen } = useLayoutStore()
  const { isFeedbackChat } = useUserStore()
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([])
  const { setViewportWidth } = useLayoutStore()
  const viewRef = useRef<HTMLDivElement>(null)
  const viewSize = useSize(viewRef)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  const isLastMessageUser = useCallback((): boolean => {
    return (
      currentChatMessages.length > 0 &&
      currentChatMessages[currentChatMessages.length - 1].sending_agent ===
      'user'
    )
  }, [currentChatMessages])

  const isLastMessageLoading = useCallback((): boolean => {
    return (
      currentChatMessages.length > 0 &&
      currentChatMessages[currentChatMessages.length - 1].render_type ===
      'LOADING'
    )
  }, [currentChatMessages])

  const scrollToBottom = () => {
    viewRef.current?.scrollTo({
      top: viewRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }

  const handleScroll = () => {
    if (!viewRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = viewRef.current
    const isAtBottom = scrollHeight - scrollTop === clientHeight

    if (isAtBottom) {
      setIsAutoScrollEnabled(true)
    } else {
      setIsAutoScrollEnabled(false)
    }
  }

  useEffect(() => {
    if (isLastMessageUser() || isLastMessageLoading() || isAutoScrollEnabled) {
      scrollToBottom()
    }
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

    setMessageGroups([...tempMessageGroups])
  }, [
    currentChatMessages,
    isLastMessageLoading,
    isLastMessageUser,
    isAutoScrollEnabled,
  ])

  useEffect(() => {
    setViewportWidth(viewSize[0])
  }, [setViewportWidth, viewSize])

  return (
    <div
      ref={viewRef}
      onScroll={handleScroll}
      className={cn(
        'relative flex min-h-[2rem] w-full flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 transition-all duration-300 ease-in-out',
        rightPanelOpen ? 'items-start' : 'items-center'
      )}
    >
      {loadingMessages ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex h-full w-[53rem] min-w-[15rem] max-w-full flex-col py-2'>
          {currentChatMessages.length === 0 ? (
            <OnboardingMessage />
          ) : (
            <>
              {isFeedbackChat && (
                <div className='flex justify-end items-center gap-2 mt-4 mr-8 -mb-4'>
                  <CircleAlert size={14} className='text-blue-500' />
                  <span className='text-xs font-medium text-blue-600'>
                    Rephrased question:
                  </span>
                </div>
              )}
              {messageGroups.map((messageGroup, groupIndex) => {
                return (
                  <MessageGroup
                    key={`${currentChat?.id}-${groupIndex}`}
                    messages={messageGroup.messages}
                    sender={messageGroup.sender}
                    isStreaming={messageGroup.streaming}
                    userMessage={messageGroup.userMessage}
                    isPopoverFeedbackChat={false}
                  />
                )
              })}
            </>
          )}
          <div className='min-h-[80px] w-full' />
        </div>
      )}
    </div>
  )
}

export default MessageView
