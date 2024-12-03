export interface Chat {
  id: string
  name: string
  created_at: string
  last_modified_at: string
  creator_id?: string
  creator?: Creator
  tasks?: any[]
}

export interface Creator {
  id: string
  name: string
  avatar: any
}
