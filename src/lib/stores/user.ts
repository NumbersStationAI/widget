import { API_URL } from 'lib/constants'
import { User } from 'lib/models/user'
import { getAuthHeaders } from 'lib/utils/token'
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
  bearerToken: string | null
  // TODO Remove this state once we have shared code between the frontend/ and
  // the widget/ and we have a separate "admin feedback" chat page.
  showAdminFeedbackButton: boolean
  login: (values: z.infer<typeof loginFormSchema>) => Promise<void>
  googleLogin: () => void
  logout: () => void
  setUnauthorized: (value: boolean) => void
  setUser: (user: User | null) => void
  setAccount: (account: string) => void
  setShowAdminFeedbackButton: (v: boolean) => void
  updateUserData: () => void
  setError: (error: string | null) => void
  setBearerToken: (token: string) => void
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  userLoading: true,
  account: null,
  unauthorized: false,
  error: null,
  bearerToken: null,
  showAdminFeedbackButton: false,
  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),
  setAccount: (account) => set({ account }),
  setUnauthorized: (value) => set({ unauthorized: value }),
  setShowAdminFeedbackButton: (v) => set({ showAdminFeedbackButton: v }),
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
          headers: getAuthHeaders(),
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
          headers: getAuthHeaders(),
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
          headers: getAuthHeaders(),
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
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/users/me`,
        {
          credentials: 'include',
          headers: getAuthHeaders(),
        },
      )
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
  setBearerToken: (token) => set({ bearerToken: token }),
}))

export const getAccount = () => {
  return (
    useUserStore.getState().account ??
    useUserStore.getState().user?.account_name ??
    ''
  )
}
