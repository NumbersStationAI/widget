export interface User {
  name: string
  email: string
  account_name: string
  role: 'USER' | 'ADMIN'
}
