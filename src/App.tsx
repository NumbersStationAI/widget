import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from 'components/Button'
import Login from 'components/Login'
import Spinner from 'components/Spinner'
import { API_URL } from 'lib/constants'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { useDatasetStore } from 'lib/stores/datasets'
import { useLayoutStore } from 'lib/stores/layout'
import { getAccount, useUserStore } from 'lib/stores/user'
import { getAuthHeaders } from 'lib/utils/token'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import './App.css'
import Widget from './Widget'

const queryClient = new QueryClient()

const App: React.FC = () => {
  const {
    fetchChats,
    fetchSuggestions,
    setCurrentChat,
    setChatInput,
    setLoadingMessages,
    setIsReadOnlyChat,
    currentChat,
  } = useChatStore()
  const {
    user,
    updateUserData,
    userLoading,
    setAccount,
    isFeedbackChat,
    setIsFeedbackChat,
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
  const { toggleSidebar, setExpanded, setShowSidebar } = useLayoutStore()

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
      const chatFromStore = useChatStore
        .getState()
        .chats.find((chat) => chat.id === chatId)
      if (!chatFromStore) {
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
          useChatStore.getState().setCurrentChat(data)
        } catch (e: any) {
          toast.error(e.message)
        }
      } else {
        setCurrentChat(chatFromStore)
      }
    },
    [setCurrentChat, setLoadingMessages],
  )

  useEffect(() => {
    if (
      currentChat &&
      user &&
      !isFeedbackChat &&
      currentChat.creator.id &&
      currentChat.creator.id !== user.id
    ) {
      setIsReadOnlyChat(true)
      setShowSidebar(false)
    } else if (currentChat && user && isFeedbackChat && user.role !== 'ADMIN') {
      setIsReadOnlyChat(true)
      setShowSidebar(false)
    } else {
      setIsReadOnlyChat(false)
    }
  }, [
    setIsReadOnlyChat,
    setShowSidebar,
    isFeedbackChat,
    user,
    currentChat,
  ])

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString) // doesn't work in IE, but who cares ;)
    const account = urlParams.get('account') ?? 'tapforce'
    const showOpenInFullButton = urlParams.get('showOpenInFullButton') ?? 'true'
    const showWidgetBorder = urlParams.get('showBorder') ?? 'true'
    const parentQuery = urlParams.get('parentParams') ?? ''
    const showMinimizeButton = urlParams.get('showMinimizeButton') ?? 'true'
    const showExpandButton = urlParams.get('showExpandButton') ?? 'true'

    // TODO Make these configuration flags more modular. It is super annoying to
    // have to edit a bunch of places to add a single configuration flag.
    const isFeedbackChat = urlParams.get('isFeedbackChat') ?? 'false'

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
    setIsFeedbackChat(isFeedbackChat === 'true')
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
    setIsFeedbackChat,
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
        if ('type' in evt.data && evt.data.type === 'SCROLL_TO_MESSAGE') {
          const messageElement = document.getElementById(evt.data.messageId)
          if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth' })
          }
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
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </>
  )
}

export default App