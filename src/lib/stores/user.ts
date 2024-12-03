import { API_URL } from 'lib/constants'
import { User } from 'lib/models/user'
import { create } from 'zustand'

type UserStore = {
  user: User | null
  account: string | null
  userLoading: boolean
  unauthorized: boolean
  logout: () => void
  setUnauthorized: (value: boolean) => void
  setUser: (user: User | null) => void
  setAccount: (account: string) => void
  updateUserData: () => void
}

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  userLoading: false,
  account: null,
  unauthorized: false,
  setUser: (user) => set({ user }),
  setAccount: (account) => set({ account }),
  setUnauthorized: (value) => set({ unauthorized: value }),
  logout: async () => {
    set({ userLoading: true })

    try {
      const response = await fetch(
        `${API_URL}/v1/logout/session?third_party=true`,
        {
          credentials: 'include',
          method: 'POST',
        },
      )
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      set({ user: null })
    } catch (e: any) {
      console.error(e.message)
    }
    set({ userLoading: false })
  },
  updateUserData: async () => {
    set({ userLoading: true })
    try {
      const response = await fetch(`${API_URL}/v1/users/me`, {
        credentials: 'include',
      })
      if (response.status > 400) {
        throw new Error('Not logged in')
      }
      const data = await response.json()
      set({ user: data, unauthorized: false })
    } catch (e: any) {
      set({ user: null })
      console.log(e.message)
    }
    set({ userLoading: false })
  },
}))

export const getAccount = () => {
  return (
    useUserStore.getState().account ??
    useUserStore.getState().user?.accounts[0].name ??
    ''
  )
}
