import { Button } from '@ns/ui/atoms/Button'

import Interrupt from 'lib/icons/interrupt.svg?react'
import Send from 'lib/icons/send.svg?react'

interface Props {
  state: 'send' | 'interrupt' | 'disabled' | 'loading'
  onSubmit?: () => void
}

function SendButton({ state, onSubmit }: Props) {
  return (
    <Button
      variant='default'
      size='icon'
      onClick={onSubmit}
      className='rounded-full'
      disabled={state === 'disabled' || state === 'loading'}
    >
      {state === 'interrupt' ? <Interrupt /> : <Send className='text-white' />}
    </Button>
  )
}

export default SendButton
