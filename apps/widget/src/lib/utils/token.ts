import { useTokenStore } from 'lib/stores/token'

export const getAuthHeaders = () => {
  const token = useTokenStore.getState().bearerToken
  const headers: { Authorization?: string } = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}
