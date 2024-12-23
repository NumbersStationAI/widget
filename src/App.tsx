import { useCallback, useEffect } from 'react'
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
import { getAuthHeaders } from 'lib/utils/token'

const App: React.FC = () => {
  const {
    fetchChats,
    fetchSuggestions,
    setCurrentChatId,
    setChatInput,
    setLoadingMessages,
  } = useChatStore()
  const {
    user,
    updateUserData,
    userLoading,
    setAccount,
    setShowAdminFeedbackButton,
    unauthorized,
    logout,
    setError,
    setBearerToken,
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
    if (user) {
      fetchChats()
      fetchDataAssets()
      fetchSuggestions()
    }
  }, [user, fetchChats, fetchDataAssets, fetchSuggestions])

  const showChat = useCallback(
    async (chatId: string) => {
      setLoadingMessages(true)
      if (!useChatStore.getState().chats.find((chat) => chat.id === chatId)) {
        try {
          const response = await fetch(
            `${API_URL}/v3/orgs/${getAccount()}/chat/${chatId}`,
            {
              credentials: 'include',
              headers: getAuthHeaders(),
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
      setCurrentChatId(chatId)
    },
    [setCurrentChatId, setLoadingMessages],
  )

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString) // doesn't work in IE, but who cares ;)
    const account = urlParams.get('account') ?? 'tapforce'
    const showOpenInFullButton = urlParams.get('showOpenInFullButton') ?? 'true'
    const showWidgetBorder = urlParams.get('showBorder') ?? 'true'
    const parentQuery = urlParams.get('parentParams') ?? ''
    const showMinimizeButton = urlParams.get('showMinimizeButton') ?? 'true'
    const showExpandButton = urlParams.get('showExpandButton') ?? 'true'
    const showAdminFeedbackButton = urlParams.get('showAdminFeedbackButton') ?? 'false' 
    const expanded = urlParams.get('expanded') ?? 'false'
    const parentUrlParams = new URLSearchParams(parentQuery)

    const error = parentUrlParams.get('error')
    const chatId = parentUrlParams.get('chatId') ?? urlParams.get('chatId')

    if (error) {
      setError(error)
      toast.error(error, { duration: 10000 })
    }

    setAccount(account)
    updateUserData()
 
    setShowOpenInFullButton(showOpenInFullButton === 'true')
    setShowWidgetBorder(showWidgetBorder === 'true')
    setShowExpandButton(showExpandButton === 'true')
    setShowMinimizeButton(showMinimizeButton === 'true')
    setShowAdminFeedbackButton(showAdminFeedbackButton === 'true')
    setExpanded(expanded === 'true')

    if (chatId) {
      const chatIdParts = chatId.split('#')
      if (chatIdParts.length > 0) {
        showChat(chatIdParts[0])
      }
    }
  }, [
    setAccount,
    updateUserData,
    setError,
    setExpanded,
    setShowExpandButton,
    setShowMinimizeButton,
    setShowOpenInFullButton,
    setShowWidgetBorder,
    setShowAdminFeedbackButton,
    showChat,
  ])

  useEffect(() => {
    const handleMessage = async (evt: any) => {
      if (
        typeof evt.data === 'object' &&
        !Array.isArray(evt.data) &&
        evt.data !== null
      ) {
        if ('setChatId' in evt.data) {
          showChat(evt.data.setChatId)
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
        if ('setBearerToken' in evt.data) {
          setBearerToken(evt.data.setBearerToken)
          updateUserData()
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [
    setChatInput,
    setShowOpenInFullButton,
    toggleSidebar,
    showChat,
    setBearerToken,
    updateUserData,
  ])

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
