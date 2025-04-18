import { type MessageApiResponse, type RenderType } from '@ns/public-api'

// TODO Remove these additional fields.
export type ChatMessage = Omit<MessageApiResponse, 'render_type'> & {
  streaming?: boolean
  // The "LOADING" render type is just used by the frontend for some optimistic
  // UI. We should likely replace it with "TEMPORARY" instead.
  render_type?: RenderType | 'LOADING'
}
