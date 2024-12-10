import { create } from 'zustand'

type CustomizationStore = {
  showOpenInFullButton: boolean
  showWidgetBorder: boolean
  showExpandButton: boolean
  showMinimizeButton: boolean
  setShowWidgetBorder: (value: boolean) => void
  setShowOpenInFullButton: (value: boolean) => void
  setShowExpandButton: (value: boolean) => void
  setShowMinimizeButton: (value: boolean) => void
}

export const useCustomizationStore = create<CustomizationStore>()((set) => ({
  showOpenInFullButton: true,
  showWidgetBorder: true,
  setShowWidgetBorder: (value) => set({ showWidgetBorder: value }),
  setShowOpenInFullButton: (value) => set({ showOpenInFullButton: value }),
  showExpandButton: true,
  showMinimizeButton: true,
  setShowExpandButton: (value) => set({ showExpandButton: value }),
  setShowMinimizeButton: (value) => set({ showMinimizeButton: value }),
}))
