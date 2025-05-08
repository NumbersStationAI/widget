import { UserRole } from '@ns/public-api'
import { MessageTable as MessageTablePrimitive } from '@ns/ui/molecules/MessageTable'

import { useLayoutStore } from 'lib/stores/layout'
import { getAccount, useUserStore } from 'lib/stores/user'

import { useMessage } from './MessageContext'
import { OpenFeedbackChatButton } from './OpenFeedbackChatButton'
import { SaveAdminFeedbackButton } from './SaveAdminFeedbackButton'
import { SensitiveSwitch } from './SensitiveSwitch'

export function MessageTable({
  isPopoverFeedbackChat,
}: {
  isPopoverFeedbackChat?: boolean
}) {
  const { message } = useMessage()
  const { user, isFeedbackChat } = useUserStore()
  const { viewportWidth } = useLayoutStore()
  return (
    <MessageTablePrimitive
      accountName={getAccount()}
      messageId={message.id}
      sql={message.sql}
      viewportWidth={viewportWidth}
    >
      <div className='mt-1 flex items-center'>
        {message.is_positive_admin_feedback && <SensitiveSwitch />}
        {user?.role === UserRole.ADMIN && (
          <div className='flex items-center gap-2 pl-1'>
            {isFeedbackChat || isPopoverFeedbackChat ? (
              <>
                <SaveAdminFeedbackButton />
              </>
            ) : (
              <OpenFeedbackChatButton />
            )}
          </div>
        )}
      </div>
    </MessageTablePrimitive>
  )
}
