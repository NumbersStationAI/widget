import { Suggestion } from './suggestions'

export interface ChatMessage {
  id: string
  response_index: number
  chat_id: string
  render_type: string
  signal_type?: any
  sending_agent: string
  receiving_agent: string
  timestamp: string
  markdown: any
  questions?: Suggestion[] | null
  sql?: string | null
  embedded_viz_url?: any
  options?: any
  selected_option?: any
  image_source?: any
  table_data?: any
  message_table_id?: string | null
  conversation_id?: any
  bumblebee_cell_id?: any
  semantic_layer_view?: any
  vega_spec?: any
  streaming?: boolean
  is_positive_feedback?: boolean
  is_positive_admin_feedback?: boolean
}
