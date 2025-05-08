import { CheckCircle, CircleDashed } from 'lucide-react'
import { toast } from 'sonner'

import {
  useAdminFeedbackClone,
  useCheckFeedbackChatHasAdminFeedback,
} from '@ns/public-api'
import { TooltipButton } from '@ns/ui/atoms/Button'

import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount } from 'lib/stores/user'

import { useMessage } from './MessageContext'

export function OpenFeedbackChatButton() {
  const { toggleRightPanel } = useLayoutStore()
  const { feedbackChatId, setFeedbackChatId, setLoadingPanelMessages } =
    usePanelChatStore()
  const { message } = useMessage()
  const { data: hasAdminFeedback = false } =
    useCheckFeedbackChatHasAdminFeedback(
      {
        accountName: getAccount(),
        chatId: message.feedback_chat_id as string,
      },
      {
        query: {
          enabled: message.feedback_chat_id != null,
          refetchInterval: 3000,
        },
      },
    )
  const { mutate: cloneChatMutation } = useAdminFeedbackClone({
    mutation: {
      onSuccess: (data) => {
        setFeedbackChatId(data.id)
        message.feedback_chat_id = data.id
        if (!message.feedback_chat_id) {
          toast('Chat cloned for feedback')
        }
      },
      onError: () => {
        toast.error('Failed to clone chat. Please try again.')
      },
    },
  })

  const onClick = () => {
    if (feedbackChatId) {
      setFeedbackChatId(null)
      toggleRightPanel()
    } else {
      if (message.feedback_chat_id == null) {
        setLoadingPanelMessages(true)
        cloneChatMutation({
          accountName: getAccount(),
          messageId: message.id,
        })
      } else {
        setFeedbackChatId(message.feedback_chat_id)
      }
      toggleRightPanel()
    }
  }
  return (
    <>
      <TooltipButton
        variant='outline'
        size='sm'
        className='h-8'
        onClick={onClick}
        tooltip='Open feedback chat'
      >
        {hasAdminFeedback ? (
          <CheckCircle className='h-4 w-4 text-green-600' />
        ) : (
          message.feedback_chat_id && <CircleDashed className='h-4 w-4' />
        )}
        Feedback
      </TooltipButton>
    </>
  )
}
