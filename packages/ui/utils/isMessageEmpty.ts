import { type MessageApiResponse } from '@ns/public-api'

export function isMessageEmpty(
  message: Pick<
    MessageApiResponse,
    'markdown' | 'sql' | 'vega_spec' | 'message_table_id'
  >,
) {
  return (
    message.markdown === null &&
    message.sql === null &&
    message.vega_spec === null &&
    message.message_table_id === null
  )
}
