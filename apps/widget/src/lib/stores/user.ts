import { z } from 'zod'
import { create } from 'zustand'

import {
  getCurrentUser,
  loginSession,
  loginSessionOauth,
  logoutSession,
  Provider,
  type UserResponse,
} from '@ns/public-api'

export const loginFormSchema = z.object({
  username: z.string().email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

type UserStore = {
  user: UserResponse | null
  account: string | null
  userLoading: boolean
  unauthorized: boolean
  error: string | null
  // TODO Remove this state once we have shared code between the frontend/ and
  // the widget/ and we have a separate "admin feedback" chat page.
  isFeedbackChat: boolean
  login: (values: z.infer<typeof loginFormSchema>) => Promise<void>
  googleLogin: () => void
  logout: () => void
  setUnauthorized: (value: boolean) => void
  setUser: (user: UserResponse | null) => void
  setAccount: (account: string) => void
  setIsFeedbackChat: (v: boolean) => void
  updateUserData: () => void
  setError: (error: string | null) => void
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  userLoading: true,
  account: null,
  unauthorized: false,
  error: null,
  isFeedbackChat: false,
  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),
  setAccount: (account) => set({ account }),
  setUnauthorized: (value) => set({ unauthorized: value }),
  setIsFeedbackChat: (v) => set({ isFeedbackChat: v }),
  login: async (data) => {
    get().setError(null)

    try {
      await loginSession({ data, params: { third_party: true } })
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
      const googleAuthRedirectUrl = await loginSessionOauth({
        params: {
          account_name: getAccount(),
          provider: Provider.google,
          third_party: true,
          redirect_uri: url,
        },
      })
      // open in popup window
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
      await logoutSession({ params: { third_party: true } })
      set({ user: null })
    } catch (e: any) {
      console.error(e.message)
    }
    set({ userLoading: false })
  },
  updateUserData: async () => {
    set({ userLoading: true })
    try {
      const data = await getCurrentUser({ accountName: getAccount() })
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
    useUserStore.getState().user?.account_name ??
    ''
  )
}
