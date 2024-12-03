import { ChatMessage } from 'lib/models/message'

export const isMessageEmpty = (message: ChatMessage) => {
  return (
    message.markdown === null &&
    message.sql === null &&
    message.vega_spec === null &&
    message.message_table_id === null
  )
}