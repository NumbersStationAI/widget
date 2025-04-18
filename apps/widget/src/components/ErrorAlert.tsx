import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from 'components/Alert'

interface Props {
  message: string
  icon?: React.ReactNode
  className?: string
}

export default function AlertDestructive({ message, icon, className }: Props) {
  return (
    <Alert className={className} variant='destructive'>
      {icon ?? <AlertCircle className='h-4 w-4' />}
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
