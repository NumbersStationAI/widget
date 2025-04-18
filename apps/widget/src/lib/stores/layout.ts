import { create } from 'zustand'

type LayoutStore = {
  expanded: boolean
  showSidebar: boolean
  rightPanelOpen: boolean
  sidebarBeforePanel: boolean
  viewportWidth: number
  setExpanded: (expanded: boolean) => void
  setShowSidebar: (showSidebar: boolean) => void
  toggleExpanded: () => void
  hideWidget: () => void
  setViewportWidth: (width: number) => void
  toggleSidebar: () => void
  toggleRightPanel: () => void
}

export const useLayoutStore = create<LayoutStore>()((set, get) => ({
  expanded: false,
  showSidebar: false,
  rightPanelOpen: false,
  sidebarBeforePanel: false,
  viewportWidth: 0,
  setViewportWidth: (width) => set({ viewportWidth: width }),
  setExpanded: (expanded) => set({ expanded, showSidebar: expanded }),
  setShowSidebar: (showSidebar) => set({ showSidebar }),
  toggleExpanded: () => get().setExpanded(!get().expanded),
  hideWidget: () => {
    window.parent.postMessage('hide', '*')
  },
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),

  toggleRightPanel: () =>
    set((state) => {
      if (!state.rightPanelOpen) {
        return {
          rightPanelOpen: true,
          sidebarBeforePanel: state.showSidebar,
          showSidebar: false,
        }
      }
      return {
        rightPanelOpen: false,
        showSidebar: state.sidebarBeforePanel,
      }
    }),
}))
