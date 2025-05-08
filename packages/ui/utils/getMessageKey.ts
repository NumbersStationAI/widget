import { type MessageApiResponse } from '@ns/public-api'

export function getMessageKey(
  message: Pick<MessageApiResponse, 'id' | 'response_index'>,
): string {
  return `${message.id}-${message.response_index}`
}
