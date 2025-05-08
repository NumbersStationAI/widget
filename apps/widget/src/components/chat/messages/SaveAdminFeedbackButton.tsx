import { Check, CircleCheckBig } from 'lucide-react'
import { toast } from 'sonner'

import { useUpdateMessageAdminFeedback } from '@ns/public-api'
import { TooltipButton } from '@ns/ui/atoms/Button'
import { Spinner } from '@ns/ui/atoms/Spinner'
import { cn } from '@ns/ui/utils/cn'

import { useChatStore } from 'lib/stores/chat'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount } from 'lib/stores/user'

import { useMessage } from './MessageContext'

export function SaveAdminFeedbackButton() {
  const { updateAdminFeedback } = useChatStore()
  const { updateFeedbackMessage, updateAdminFeedback: up } = usePanelChatStore()
  const { message } = useMessage()
  const { mutate, isPending } = useUpdateMessageAdminFeedback({
    mutation: {
      onSuccess: (message) => {
        updateFeedbackMessage(message.id, message.response_index ?? 0, message)
        updateAdminFeedback(message.id, message.is_positive_admin_feedback)
        up(message.id, message.is_positive_admin_feedback)
        toast(
          message.is_positive_admin_feedback
            ? 'Feedback saved'
            : 'Feedback removed',
        )
      },
      onError: () => {
        toast.error('Failed to update feedback. Please try again.')
      },
    },
  })
  return message.is_positive_admin_feedback ? (
    <TooltipButton
      variant='outline'
      size='sm'
      onClick={() =>
        mutate({
          accountName: getAccount(),
          messageId: message.id,
          data: { is_positive_admin_feedback: false },
        })
      }
      className={cn(
        'group/feedback relative h-8 text-green-600 transition-all duration-300 ease-in-out hover:pr-[68px] hover:text-green-600',
        isPending && 'cursor-wait',
      )}
    >
      {isPending ? (
        <Spinner size={0.4} />
      ) : (
        <CircleCheckBig className='h-4 w-4' />
      )}
      <div className='pointer-events-none absolute translate-x-10 text-xs opacity-0 group-hover/feedback:pointer-events-auto group-hover/feedback:opacity-100 group-hover/feedback:delay-150'>
        Feedback
      </div>
    </TooltipButton>
  ) : (
    <TooltipButton
      variant='outline'
      size='sm'
      onClick={() =>
        mutate({
          accountName: getAccount(),
          messageId: message.id,
          data: { is_positive_admin_feedback: true },
        })
      }
      tooltip='Save feedback'
      className={cn('h-8', isPending && 'cursor-wait')}
    >
      {isPending ? <Spinner size={0.4} /> : <Check className='h-4 w-4' />}
      Save feedback
    </TooltipButton>
  )
}
