import { useNavigate } from '@tanstack/react-router'
import {
  ErrorBoundary as Boundary,
  type FallbackProps,
} from 'react-error-boundary'

import { Button } from '@ns/ui/atoms/Button'
import { ErrorBoundaryContent } from '@ns/ui/molecules/ErrorBoundaryContent'

function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorBoundaryContent error={error}>
      <Button size='lg' className='mt-2 w-44' onClick={resetErrorBoundary}>
        Go back to home
      </Button>
    </ErrorBoundaryContent>
  )
}

export function ErrorBoundary({ children }: React.PropsWithChildren) {
  const navigate = useNavigate()
  return (
    <Boundary
      FallbackComponent={FallbackComponent}
      onReset={() => navigate({ to: '/$' })}
    >
      {children}
    </Boundary>
  )
}
