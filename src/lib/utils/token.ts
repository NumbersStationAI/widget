import { useUserStore } from 'lib/stores/user'

export const getAuthHeaders = () => {
  const token = useUserStore.getState().bearerToken

  const headers: any = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}
