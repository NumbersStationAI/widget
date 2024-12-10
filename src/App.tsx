import { useEffect } from 'react'
import './App.css'
import Login from 'components/Login'
import Spinner from 'components/Spinner'
import { useChatStore } from 'lib/stores/chat'
import { getAccount, useUserStore } from 'lib/stores/user'
import { useDatasetStore } from 'lib/stores/datasets'
import Widget from './Widget'
import { Button } from 'components/Button'
import { API_URL } from 'lib/constants'
import { toast } from 'sonner'
import { useCustomizationStore } from 'lib/stores/customization'
import { useLayoutStore } from 'lib/stores/layout'

const App: React.FC = () => {
  const { fetchChats, fetchSuggestions, setCurrentChatId, setChatInput } =
    useChatStore()
  const {
    user,
    updateUserData,
    userLoading,
    setAccount,
    unauthorized,
    logout,
    setError,
  } = useUserStore()
  const { fetchDataAssets } = useDatasetStore()
  const {
    setShowOpenInFullButton,
    setShowWidgetBorder,
    setShowExpandButton,
    setShowMinimizeButton,
  } = useCustomizationStore()
  const { toggleSidebar, setExpanded } = useLayoutStore()

  useEffect(() => {
    updateUserData()
  }, [updateUserData])

  useEffect(() => {
    if (user) {
      fetchChats()
      fetchDataAssets()
      fetchSuggestions()
    }
  }, [user, fetchChats, fetchDataAssets, fetchSuggestions])

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString) // doesn't work in IE, but who cares ;)
    const account = urlParams.get('account') ?? 'tapforce'
    const showOpenInFullButton = urlParams.get('showOpenInFullButton') ?? 'true'
    const showWidgetBorder = urlParams.get('showBorder') ?? 'true'
    const parentQuery = urlParams.get('parentParams') ?? ''
    const showMinimizeButton = urlParams.get('showMinimizeButton') ?? 'true'
    const showExpandButton = urlParams.get('showExpandButton') ?? 'true'
    const expanded = urlParams.get('expanded') ?? 'false'
    const parentUrlParams = new URLSearchParams(parentQuery)

    const error = parentUrlParams.get('error')

    if (error) {
      setError(error)
      toast.error(error, { duration: 10000 })
    }

    setAccount(account)
    setShowOpenInFullButton(showOpenInFullButton === 'true')
    setShowWidgetBorder(showWidgetBorder === 'true')
    setShowExpandButton(showExpandButton === 'true')
    setShowMinimizeButton(showMinimizeButton === 'true')
    setExpanded(expanded === 'true')
  }, [
    setAccount,
    setError,
    setExpanded,
    setShowExpandButton,
    setShowMinimizeButton,
    setShowOpenInFullButton,
    setShowWidgetBorder,
  ])

  useEffect(() => {
    const handleMessage = async (evt: any) => {
      if (
        typeof evt.data === 'object' &&
        !Array.isArray(evt.data) &&
        evt.data !== null
      ) {
        if ('setChatId' in evt.data) {
          if (
            !useChatStore
              .getState()
              .chats.find((chat) => chat.id === evt.data.setChatId)
          ) {
            try {
              const response = await fetch(
                `${API_URL}/v3/orgs/${getAccount()}/chat/${evt.data.setChatId}`,
                {
                  credentials: 'include',
                },
              )
              if (!response.ok) {
                throw new Error('Chat not found')
              }
              const data = await response.json()
              useChatStore.getState().addChat(data)
            } catch (e: any) {
              toast.error(e.message)
            }
          }
          setCurrentChatId(evt.data.setChatId)
        }
        if ('setShowOpenInFullButton' in evt.data) {
          setShowOpenInFullButton(evt.data.setShowOpenInFullButton)
        }
        if ('setChatInput' in evt.data) {
          setChatInput(evt.data.setChatInput)
        }
        if ('toggleSidebar' in evt.data) {
          toggleSidebar()
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [setChatInput, setCurrentChatId, setShowOpenInFullButton, toggleSidebar])

  return (
    <>
      {userLoading ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Spinner />{' '}
        </div>
      ) : user ? (
        unauthorized ? (
          <div className='mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-4'>
            You are not authorized to access this account
            <Button onClick={logout}>Logout</Button>
          </div>
        ) : (
          <Widget />
        )
      ) : (
        <Login />
      )}
    </>
  )
}

export default App
