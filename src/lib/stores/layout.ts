import { create } from 'zustand'

type LayoutStore = {
  expanded: boolean
  showSidebar: boolean
  viewportWidth: number
  setExpanded: (expanded: boolean) => void
  setShowSidebar: (showSidebar: boolean) => void
  toggleExpanded: () => void
  hideWidget: () => void
  setViewportWidth: (width: number) => void
}

export const useLayoutStore = create<LayoutStore>()((set, get) => ({
  expanded: false,
  showSidebar: false,
  viewportWidth: 0,
  setViewportWidth: (width) => set({ viewportWidth: width }),
  setExpanded: (expanded) => set({ expanded, showSidebar: false }),
  setShowSidebar: (showSidebar) => set({ showSidebar }),
  toggleExpanded: () => get().setExpanded(!get().expanded),
  hideWidget: () => {
    window.parent.postMessage('hide', '*')
  },
}))
