import Spinner from 'components/Spinner';
import { ChatMessage } from 'lib/models/message';
import { useFeedbackStore } from 'lib/stores/feedback';
import { CircleAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import MessageGroup from '../messages/MessageGroupView';

interface MessageGroup {
    userMessage: ChatMessage;
    sender: 'user' | 'system';
    messages: ChatMessage[];
    streaming?: boolean;
}

interface FeedbackViewProps {
    feedbackChatId: string | null;
}

export function FeedbackChatView({ feedbackChatId }: FeedbackViewProps) {
    const {
        currentFeedbackMessages,
        loadingFeedbackMessages,
        setFeedbackChatId
    } = useFeedbackStore()
    const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([])
    const viewRef = useRef<HTMLDivElement>(null)
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const isLastMessageUser = useCallback((): boolean => {
        return (
            currentFeedbackMessages.length > 0 &&
            currentFeedbackMessages[currentFeedbackMessages.length - 1].sending_agent === 'user'
        )
    }, [currentFeedbackMessages])

    const isLastMessageLoading = useCallback((): boolean => {
        return (
            currentFeedbackMessages.length > 0 &&
            currentFeedbackMessages[currentFeedbackMessages.length - 1].render_type === 'LOADING'
        )
    }, [currentFeedbackMessages])
    const scrollToBottom = useCallback((immediate = false) => {
        if (!messagesEndRef.current) return
        messagesEndRef.current.scrollIntoView({
            behavior: immediate ? 'auto' : 'smooth'
        })
    }, [])
    const handleScroll = useCallback(() => {
        if (!viewRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = viewRef.current
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10
        setIsAutoScrollEnabled(isAtBottom)
    }, [])
    useEffect(() => {
        setFeedbackChatId(feedbackChatId)
    }, [feedbackChatId, setFeedbackChatId])
    useEffect(() => {
        const tempMessageGroups: MessageGroup[] = []
        let currentGroup: MessageGroup | null = null
        let currentUserMessage: ChatMessage
        currentFeedbackMessages.forEach((message) => {
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
    }, [currentFeedbackMessages])
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
    }, [currentFeedbackMessages, isLastMessageUser, isLastMessageLoading, isAutoScrollEnabled, scrollToBottom])
    return (
        <div
            ref={viewRef}
            onScroll={handleScroll}
            className='relative flex min-h-[2rem] w-full flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-4'
        >
            {loadingFeedbackMessages ? (
                <div className='flex h-full w-full items-center justify-center'>
                    <Spinner />
                </div>
            ) : (
                <div className='flex h-full w-[53rem] min-w-[15rem] max-w-full flex-col py-2'>
                    {!currentFeedbackMessages.length ? (
                        <div className='p-4'>No messages found in this chat.</div>
                    ) : (
                        <>
                            <div className='flex justify-end items-center gap-2 mt-4 mr-8'>
                                <CircleAlert size={14} className='text-blue-500' />
                                <span className='text-xs font-medium text-blue-600'>
                                    Rephrased question:
                                </span>
                            </div>
                            {messageGroups.map((messageGroup, groupIndex) => (
                                <MessageGroup
                                    key={`${feedbackChatId}-${groupIndex}`}
                                    messages={messageGroup.messages}
                                    sender={messageGroup.sender}
                                    isStreaming={messageGroup.streaming}
                                    userMessage={messageGroup.userMessage}
                                    isPopoverFeedbackChat
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
