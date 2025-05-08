import { useId } from 'react'

import { useUpdateMessageAdminFeedback } from '@ns/public-api'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ns/ui/atoms/Tooltip'

import { Label } from 'components/Label'
import { Switch } from 'components/Switch'
import { useChatStore } from 'lib/stores/chat'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount } from 'lib/stores/user'

import { useMessage } from './MessageContext'

export function SensitiveSwitch() {
  const id = useId()
  const { updateChatMessage, updateAdminFeedback } = useChatStore()
  const { updateFeedbackMessage, updateAdminFeedback: up } = usePanelChatStore()
  const { message } = useMessage()
  const { mutate, variables } = useUpdateMessageAdminFeedback({
    mutation: {
      onSuccess: (message) => {
        updateChatMessage(message.id, message.response_index ?? 0, message)
        updateFeedbackMessage(message.id, message.response_index ?? 0, message)
        updateAdminFeedback(message.id, message.is_positive_admin_feedback)
        up(message.id, message.is_positive_admin_feedback)
      },
    },
  })
  return (
    <div className='flex items-center gap-1'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Switch
            id={id}
            checked={
              message.is_dm_sensitive
                ? true
                : (variables?.data?.is_user_sensitive ??
                  message.is_user_sensitive ??
                  false)
            }
            disabled={message.is_dm_sensitive ?? false}
            onCheckedChange={(is_user_sensitive) =>
              mutate({
                accountName: getAccount(),
                messageId: message.id,
                data: {
                  is_user_sensitive,
                  is_positive_admin_feedback:
                    message.is_positive_admin_feedback,
                },
              })
            }
          />
        </TooltipTrigger>
        {message.is_dm_sensitive && (
          <TooltipContent>
            This message uses sensitive items. To change the sensitivity, edit
            or remove those items.
          </TooltipContent>
        )}
      </Tooltip>
      <Label className='text-xs' htmlFor={id}>
        Sensitive
      </Label>
    </div>
  )
}
