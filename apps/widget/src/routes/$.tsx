import { createFileRoute, Navigate } from '@tanstack/react-router'

import { Button } from '@ns/ui/atoms/Button'
import { Spinner } from '@ns/ui/atoms/Spinner'

import { useUserStore } from 'lib/stores/user'

export const Route = createFileRoute('/$')({ component: Index })

function Index() {
  const { user, userLoading, unauthorized, logout } = useUserStore()

  return userLoading ? (
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
      <Navigate to='/chats' search />
    )
  ) : (
    <Navigate to='/login' search />
  )
}
