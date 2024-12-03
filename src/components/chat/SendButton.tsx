import { Button } from 'components/Button'
import { ReactComponent as Send } from 'lib/icons/send.svg'
import { ReactComponent as Interrupt } from 'lib/icons/interrupt.svg'

interface Props {
  state: 'send' | 'interrupt' | 'disabled' | 'loading'
  onSubmit?: () => void
}

const SendButton: React.FC<Props> = ({ state, onSubmit }) => {
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
