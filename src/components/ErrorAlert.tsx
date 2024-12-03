import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from 'components/Alert'

interface Props {
  message: string
  icon?: React.ReactNode
}

const AlertDestructive: React.FC<Props> = ({ message, icon }) => {
  return (
    <Alert variant='destructive'>
      {icon ?? <AlertCircle className='h-4 w-4' />}
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export default AlertDestructive
