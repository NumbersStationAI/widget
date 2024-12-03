import { useEffect, useState } from 'react'
import './App.css'
import Login from 'components/Login'
import Spinner from 'components/Spinner'
import { useChatStore } from 'lib/stores/chat'
import { getAccount, useUserStore } from 'lib/stores/user'
import { useDatasetStore } from 'lib/stores/datasets'
import Widget from './Widget'
import { Alert } from 'components/Alert'
import ErrorAlert from 'components/ErrorAlert'
import { Button } from 'components/Button'
import { API_URL } from 'lib/constants'
import { toast } from 'sonner'

const App: React.FC = () => {
  const { updateChats, updateSuggestions, setCurrentChatId, deleteChat } =
    useChatStore()
  const {
    user,
    updateUserData,
    userLoading,
    setAccount,
    setUser,
    unauthorized,
    logout,
  } = useUserStore()
  const { updateDatasets } = useDatasetStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    updateUserData()
  }, [])

  useEffect(() => {
    if (user) {
      updateChats()
      updateDatasets()
      updateSuggestions()
    }
  }, [user])

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString) // doesn't work in IE, but who cares ;)
    const account = urlParams.get('account') ?? 'tapforce'
    if (account) {
      setAccount(account)
    }
  }, [])

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
              const data = await response.json()
              useChatStore.getState().addChat(data)
            } catch (e: any) {
              toast.error(e.message)
            }
          }
          setCurrentChatId(evt.data.setChatId)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [setCurrentChatId])

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
        <Login
        />
      )}
      <div className='fixed bottom-0 left-0 right-0 p-2'>
        {/*
      <Button onClick={()=>{
        const chats = useChatStore.getState().chats
        chats.forEach(chat => {
          deleteChat(chat.id)
        })
      }}>Delete Chats</Button>
      */}
        {error && <ErrorAlert message={error} />}
      </div>
    </>
  )
}

export default App
