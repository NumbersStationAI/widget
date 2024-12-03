import { ChatMessage } from 'lib/models/message'
import MessageMarkdown from './MessageMarkdown'
import MessageTable, { TableViewMode } from './MessageTable'
import VegaEmbed from './VegaEmbed'
import Tableau from './Tableau'
import SuggestionItem from './SuggestionItem'

interface Props {
  message: ChatMessage
  groupIndex: number
}

const ChatMessageWidget: React.FC<Props> = ({ message, groupIndex }) => {
  return (
    <div
      className={`flex flex-col ${message.sending_agent !== 'user' ? 'w-full' : 'w-fit self-end rounded-xl bg-[#F5F5F5] px-4 py-2'} max-w-full justify-center gap-1`}
    >
      {message.markdown && (
        <MessageMarkdown>{message.markdown}</MessageMarkdown>
      )}
      {message.message_table_id && (
        <MessageTable
          messageId={message.id}
          sql={message.sql}
          streaming={message.streaming}
        />
      )}
      {message.vega_spec && message.vega_spec !== undefined && (
        <VegaEmbed spec={JSON.parse(message.vega_spec)} />
      )}
      {message.embedded_viz_url && <Tableau url={message.embedded_viz_url} />}
      {message.questions && (
        <div className='mt-6 flex flex-col gap-6'>
          <p className='text-[1rem]'>
            Here are some suggested questions from your knowledge base:
          </p>
          {message.questions?.map((question, index) => (
            <SuggestionItem key={index} suggestion={question} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatMessageWidget
