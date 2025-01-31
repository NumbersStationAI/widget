export interface Chat {
  id: string
  name: string
  created_at: string
  last_modified_at: string
  creator: Creator
  is_feedback_chat: boolean
}

export interface Creator {
  id: string
  name: string
  avatar: any
}
