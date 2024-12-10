import Spinner from 'components/Spinner'
import { useChatStore } from 'lib/stores/chat'
import { ChatMessage } from 'lib/models/message'
import { useCallback, useEffect, useRef, useState } from 'react'
import OnboardingMessage from './messages/OnboardingMessage'
import useSize from '@react-hook/size'
import { useLayoutStore } from 'lib/stores/layout'
import MessageGroupView from './messages/MessageGroupView'

interface MessageGroup {
  userMessage?: ChatMessage
  sender: 'user' | 'ai'
  messages: ChatMessage[]
  streaming?: boolean
}
const MessageView: React.FC = () => {
  const { currentChatMessages, loadingMessages, currentChatId } = useChatStore()
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([])
  const { setViewportWidth } = useLayoutStore()
  const viewRef = useRef<HTMLDivElement>(null)
  const viewSize = useSize(viewRef)

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

  const isScrollAtBottom = () => {
    return viewRef.current
      ? Math.abs(
          viewRef.current.scrollHeight -
            viewRef.current.scrollTop -
            viewRef.current.clientHeight,
        )
      : 0 < 20
  }

  const scrollToBottom = () => {
    viewRef.current?.scrollTo(0, viewRef.current.scrollHeight)
  }

  useEffect(() => {
    if (isLastMessageUser() || isLastMessageLoading() || isScrollAtBottom()) {
      scrollToBottom()
    }
    const tempMessageGroups: MessageGroup[] = []
    let currentGroup: MessageGroup | null = null
    let currentUserMessage: ChatMessage | undefined = undefined
    currentChatMessages.forEach((message) => {
      const messageSender = message.sending_agent === 'user' ? 'user' : 'ai'
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
  }, [currentChatMessages, isLastMessageLoading, isLastMessageUser])

  useEffect(() => {
    setViewportWidth(viewSize[0])
  }, [setViewportWidth, viewSize])

  return (
    <div
      ref={viewRef}
      className='relative flex min-h-[2rem] w-full flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-4'
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
            messageGroups.map((messageGroup, groupIndex) => {
              return (
                <MessageGroupView
                  key={messageGroup.messages[0].id ?? `${currentChatId}-${groupIndex}`}
                  messages={messageGroup.messages}
                  sender={messageGroup.sender}
                  streaming={messageGroup.streaming}
                  userMessage={messageGroup.userMessage}
                />
              )
            })
          )}
          <div className='min-h-[20vh] w-full' />
        </div>
      )}
    </div>
  )
}

export default MessageView
