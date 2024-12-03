export interface User {
  name: string
  email: string
  avatar: any
  is_superuser: boolean
  id: string
  created_at: string
  updated_at: string
  accounts: Account[]
  is_admin_for: any[]
  is_eval_maintainer_for: any[]
}

export interface Account {
  name: string
  display_name: string
  description: any
  avatar: any
  colors: any
  id: string
  created_at: string
  updated_at: string
  allowed_domains: any[]
}
