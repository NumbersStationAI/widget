import { ChatMessage } from 'lib/models/message'
import MessageMarkdown from './MessageMarkdown'
import Spinner from 'components/Spinner'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProgressMessagesProps {
  messages: ChatMessage[]
}

const ProgressMessages: React.FC<ProgressMessagesProps> = ({ messages }) => {
  const [showAll, setShowAll] = useState(false)
  const [completedMessages, setCompletedMessages] = useState<ChatMessage[]>([])
  const [currentProgressMessage, setCurrentProgressMessage] =
    useState<ChatMessage | null>(null)

  useEffect(() => {
    setCurrentProgressMessage(messages[messages.length - 1])
    setCompletedMessages([...messages].splice(0, messages.length - 1))
  }, [messages])

  return (
    <button
      className='flex w-fit flex-col items-start justify-center rounded-xl bg-[#FAFAFA] px-3 py-1 text-sm'
      onClick={() => setShowAll(!showAll)}
    >
      <div className='flex h-[2.25rem] w-full items-center gap-3'>
        <Spinner size={0.5} />
        {currentProgressMessage && currentProgressMessage.markdown && (
          <MessageMarkdown>{currentProgressMessage.markdown}</MessageMarkdown>
        )}
        <div className='flex-1' />
        <div>
          {showAll ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </div>
      </div>
      {showAll &&
        completedMessages.map((message, index) => (
          <div
            key={index}
            className='flex h-[1.75rem] items-center gap-2 !text-[#525252]'
          >
            <Check className='h-[24px] w-[24px] flex-shrink-0 p-1' />
            {message.markdown && (
              <MessageMarkdown className='!text-sm !text-[#525252]'>
                {message.markdown}
              </MessageMarkdown>
            )}
          </div>
        ))}
    </button>
  )
}

export default ProgressMessages
