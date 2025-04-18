import { isRouteErrorResponse } from '@remix-run/react'
import { AlertTriangle } from 'lucide-react'

export type ErrorBoundaryContentProps = React.PropsWithChildren<{
  error: unknown
}>

export function ErrorBoundaryContent({
  error,
  children,
}: ErrorBoundaryContentProps) {
  let message = ''
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`
  } else if (error instanceof Error) {
    message = error.message
  }

  // Hard-code a friendlier error message for Azure's 502 errors (NS-8788).
  if (message.includes('502 Bad Gateway')) {
    message = 'Encountered a gateway error. Please try again.'
  }

  return (
    <main className='flex h-screen w-screen flex-col items-center bg-white'>
      <article className='flex h-full max-w-sm flex-col items-center justify-center gap-4 text-center'>
        <AlertTriangle className='h-8 w-8 text-neutral-400' />
        <h3 className='text-base font-semibold text-neutral-900'>{message}</h3>
        <p className='text-sm text-neutral-600'>
          It seems the resource you requested either does not exist or you do
          not have permission to access it. Either go back or switch to an
          account with access. If your access changed recently, try signing out
          and signing back in.
        </p>
        {children}
      </article>
    </main>
  )
}
