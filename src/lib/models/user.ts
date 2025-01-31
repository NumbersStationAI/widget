export interface User {
  id: string
  name: string
  email: string
  account_name: string
  role: 'USER' | 'ADMIN'
}
