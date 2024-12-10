import { API_URL } from 'lib/constants'
import { User } from 'lib/models/user'
import { z } from 'zod'
import { create } from 'zustand'

export const loginFormSchema = z.object({
  username: z.string().email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type UserStore = {
  user: User | null
  account: string | null
  userLoading: boolean
  unauthorized: boolean
  error: string | null
  login: (values: z.infer<typeof loginFormSchema>) => Promise<void>
  googleLogin: () => void
  logout: () => void
  setUnauthorized: (value: boolean) => void
  setUser: (user: User | null) => void
  setAccount: (account: string) => void
  updateUserData: () => void
  setError: (error: string | null) => void
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  userLoading: false,
  account: null,
  unauthorized: false,
  error: null,
  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),
  setAccount: (account) => set({ account }),
  setUnauthorized: (value) => set({ unauthorized: value }),
  login: async (values) => {
    get().setError(null)

    try {
      const formData = new FormData()
      formData.append('username', values.username)
      formData.append('password', values.password)
      const response = await fetch(
        `${API_URL}/v1/login/session?third_party=true`,
        {
          credentials: 'include',
          method: 'POST',
          body: formData,
        },
      )
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      get().updateUserData()
    } catch (e: any) {
      get().setError(e.message)
    }
  },

  googleLogin: async () => {
    try {
      let url =
        window.location !== window.parent.location
          ? document.referrer
          : document.location.href
      url = url.split('?')[0]
      const response = await fetch(
        `${API_URL}/v1/login/session/oauth?provider=google&account_name=${getAccount()}&third_party=true&redirect_uri=${encodeURIComponent(url)}`,
        {
          credentials: 'include',
          method: 'GET',
        },
      )
      if (!response.ok) {
        throw new Error('Google login failed')
      }
      const googleAuthRedirectUrl = await response.text()
      //open in popup window
      if (window.top) {
        window.top.location.href = googleAuthRedirectUrl
      } else {
        window.location.href = googleAuthRedirectUrl
      }
    } catch (e: any) {
      get().setError(e.message)
    }
  },

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
      console.error(e.message)
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
