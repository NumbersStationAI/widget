import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { getChat, UserRole } from '@ns/public-api'
import { TooltipProvider } from '@ns/ui/atoms/Tooltip'

import { WidgetProvider } from 'ChatProvider'
import { editorConfig } from 'components/chatEditorConfig'
import { ErrorBoundary } from 'components/ErrorBoundary'
import { Toaster } from 'components/Toast'
import { useChatStore } from 'lib/stores/chat'
import { defaultState, useCustomizationStore } from 'lib/stores/customization'
import { useDatasetStore } from 'lib/stores/datasets'
import { useLayoutStore } from 'lib/stores/layout'
import { useTokenStore } from 'lib/stores/token'
import { getAccount, useUserStore } from 'lib/stores/user'

import 'index.css'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WidgetProvider>
          <TooltipProvider>
            <LexicalComposer initialConfig={editorConfig}>
              <App />
              <Toaster />
            </LexicalComposer>
          </TooltipProvider>
        </WidgetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  ),
})

function App() {
  const {
    fetchChats,
    setCurrentChat,
    setInputValue,
    setLoadingMessages,
    setIsReadOnlyChat,
    currentChat,
  } = useChatStore()
  const { setBearerToken } = useTokenStore()
  const {
    user,
    updateUserData,
    setAccount,
    isFeedbackChat,
    setIsFeedbackChat,
    setError,
  } = useUserStore()
  const { fetchDataAssets } = useDatasetStore()
  const { setState } = useCustomizationStore()
  const { toggleSidebar, setExpanded, setShowSidebar } = useLayoutStore()

  // If we navigate away from the chats UI, we should clear the current chat to
  // avoid any weird behavior when e.g. sending messages.
  const location = useLocation()
  useEffect(() => {
    if (location.pathname !== '/chats') setCurrentChat(null)
  }, [location.pathname, setCurrentChat])

  useEffect(() => {
    if (user) {
      fetchChats()
      fetchDataAssets()
    }
  }, [user, fetchChats, fetchDataAssets])

  const showChat = useCallback(
    async (chatId: string) => {
      setLoadingMessages(true)
      const chatFromStore = useChatStore
        .getState()
        .chats.find((chat) => chat.id === chatId)
      if (!chatFromStore) {
        try {
          const data = await getChat({ accountName: getAccount(), chatId })
          useChatStore.getState().setCurrentChat(data)
        } catch (e) {
          toast.error((e as Error).message)
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
    } else if (
      currentChat &&
      user &&
      isFeedbackChat &&
      user.role !== UserRole.ADMIN
    ) {
      setIsReadOnlyChat(true)
      setShowSidebar(false)
    } else {
      setIsReadOnlyChat(false)
    }
  }, [setIsReadOnlyChat, setShowSidebar, isFeedbackChat, user, currentChat])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const showOpenInFullButton =
      searchParams.get('showOpenInFullButton') ?? 'true'
    const showMinimizeButton = searchParams.get('showMinimizeButton') ?? 'true'
    const showExpandButton = searchParams.get('showExpandButton') ?? 'true'
    const showAttachFileButton =
      searchParams.get('showAttachFileButton') ?? 'false'
    const showDeepResearchButton =
      searchParams.get('showDeepResearchButton') ?? 'false'
    const showCopyLinkButton = searchParams.get('showCopyLinkButton') ?? 'true'
    const showCopyIdButton = searchParams.get('showCopyIdButton') ?? 'false'

    const showInput = searchParams.get('showInput') ?? 'true'

    const expanded = searchParams.get('expanded') ?? 'false'
    const chatId = searchParams.get('chatId')

    const getParam = (param: keyof typeof defaultState) => {
      return searchParams.has(param)
        ? searchParams.get(param) === 'true'
        : defaultState[param]
    }

    const account = searchParams.get('account')
    if (account == null) {
      const message =
        'There was no account set. If you are embedding the Numbers Station ' +
        'widget via the loader <script>, please set the data-account ' +
        'attribute on the <script>. If you are visiting the widget directly ' +
        'or embedding the <iframe> yourself, please set the account=' +
        'youraccountname URL search parameter.'
      throw new Error(message)
    }
    setAccount(account)

    updateUserData()
    setState({
      showAttachFileButton: showAttachFileButton === 'true',
      showDeepResearchButton: showDeepResearchButton === 'true',
      showOpenInFullButton: showOpenInFullButton === 'true',
      showExpandButton: showExpandButton === 'true',
      showMinimizeButton: showMinimizeButton === 'true',
      showInput: showInput === 'true',
      showCopyLinkButton: showCopyLinkButton === 'true',
      showCopyIdButton: showCopyIdButton === 'true',
      showPromptLibrary: getParam('showPromptLibrary'),
      showAgentTagging: getParam('showAgentTagging'),

      searchAgent: getParam('searchAgent'),
      sqlQueryAgent: getParam('sqlQueryAgent'),
      predictiveModelAgent: getParam('predictiveModelAgent'),
      vegaChartAgent: getParam('vegaChartAgent'),
      emailAgent: getParam('emailAgent'),
      fileSearchAgent: getParam('fileSearchAgent'),
      webSearchAgent: getParam('webSearchAgent'),
    })
    setIsFeedbackChat(searchParams.get('isFeedbackChat') === 'true')
    setExpanded(expanded === 'true')

    if (chatId) {
      const chatIdParts = chatId.split('#')
      if (chatIdParts.length > 0) {
        showChat(chatIdParts[0])
      }
    }
  }, [
    setState,
    setAccount,
    updateUserData,
    setError,
    setExpanded,
    setIsFeedbackChat,
    showChat,
  ])

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<unknown>) => {
      if (
        typeof event.data === 'object' &&
        !Array.isArray(event.data) &&
        event.data !== null
      ) {
        if (
          'setChatId' in event.data &&
          typeof event.data.setChatId === 'string'
        ) {
          showChat(event.data.setChatId)
        }

        if (
          'setChatInput' in event.data &&
          typeof event.data.setChatInput === 'string'
        ) {
          setInputValue(event.data.setChatInput)
        }

        if ('toggleSidebar' in event.data) {
          toggleSidebar()
        }

        if (
          'setBearerToken' in event.data &&
          typeof event.data.setBearerToken === 'string'
        ) {
          setBearerToken(event.data.setBearerToken)
          updateUserData()
        }

        if (
          'type' in event.data &&
          event.data.type === 'RESTART_CHAT' &&
          'chatId' in event.data &&
          typeof event.data.chatId === 'string'
        ) {
          if (currentChat?.id !== event.data.chatId) {
            await showChat(event.data.chatId)
          }
          useChatStore.getState().restartChat()
        }

        if ('type' in event.data && event.data.type === 'CLEAR_CHAT') {
          useChatStore.getState().setCurrentChatMessages([])
          useChatStore.getState().setIsFeedbackRestarting(true)
        }

        if (
          'type' in event.data &&
          event.data.type === 'SCROLL_TO_MESSAGE' &&
          'messageId' in event.data &&
          typeof event.data.messageId === 'string'
        ) {
          const messageElement = document.getElementById(event.data.messageId)
          if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [
    setInputValue,
    toggleSidebar,
    showChat,
    setBearerToken,
    updateUserData,
    currentChat,
  ])

  return <Outlet />
}
