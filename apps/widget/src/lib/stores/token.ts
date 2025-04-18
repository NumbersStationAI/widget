import { create } from 'zustand'

type TokenStore = {
  bearerToken: string | null
  setBearerToken: (token: string) => void
}

export const useTokenStore = create<TokenStore>()((set) => ({
  bearerToken: null,
  setBearerToken: (token) => set({ bearerToken: token }),
}))
