import { createContext, useContext } from 'react'

interface WidgetContextProps {
  hide: () => void
  expand: () => void
  shrink: () => void
}

export const widgetContext = createContext<WidgetContextProps | undefined>(
  undefined,
)

interface ChatProviderProps {
  children: any
}

export function WidgetProvider({ children }: ChatProviderProps) {
  const expand = () => {
    window.parent.postMessage('expand', '*')
  }

  const shrink = () => {
    window.parent.postMessage('shrink', '*')
  }

  const hide = () => {
    window.parent.postMessage('hide', '*')
  }

  return (
    <widgetContext.Provider
      value={{
        hide,
        expand,
        shrink,
      }}
    >
      {children}
    </widgetContext.Provider>
  )
}

export const useWidget = (): WidgetContextProps => {
  const context = useContext(widgetContext)

  if (!context) {
    throw new Error('useChatContext must be within ChatProvider')
  }

  return context
}
