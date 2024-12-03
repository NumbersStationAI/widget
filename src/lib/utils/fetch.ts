import { useUserStore } from 'lib/stores/user'

export const checkResponseError = (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      useUserStore.getState().setUnauthorized(true)
    }
    throw new Error(response.statusText)
  }
}
