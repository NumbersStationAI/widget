import {
  AlertCircle,
  CheckCircle,
  CircleDashed,
  ExternalLink,
  X,
} from 'lucide-react'

import {
  useCheckFeedbackChatHasAdminFeedback,
  useGetChat,
} from '@ns/public-api'
import { Button } from '@ns/ui/atoms/Button'

import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount } from 'lib/stores/user'

import { FeedbackChatInput } from './FeedbackChatInput'
import { FeedbackChatView } from './FeedbackChatView'

export function FeedbackView() {
  const feedbackChatId = usePanelChatStore((state) => state.feedbackChatId)
  const { loadingPanelMessages } = usePanelChatStore()
  const { toggleRightPanel } = useLayoutStore()
  const { setFeedbackChatId } = usePanelChatStore()
  const { data: chat, isPending: chatPending } = useGetChat({
    accountName: getAccount(),
    chatId: feedbackChatId as string,
  })
  const { data: hasAdminFeedback = false } =
    useCheckFeedbackChatHasAdminFeedback(
      {
        accountName: getAccount(),
        chatId: feedbackChatId as string,
      },
      {
        query: {
          enabled: feedbackChatId != null,
          refetchInterval: 3000,
        },
      },
    )
  const navigateToFeedback = () => {
    window.parent.postMessage(
      {
        type: 'NAVIGATE_TO_FEEDBACK',
        path: `/${getAccount()}/monitor/feedback/${feedbackChatId}`,
      },
      '*',
    )
  }
  if (!feedbackChatId && !loadingPanelMessages) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        No feedback chat selected
      </div>
    )
  }
  return (
    <div className='flex h-full w-full items-center justify-center bg-gray-100'>
      <div className='flex h-[95%] w-[95%] max-w-3xl flex-col rounded border bg-white shadow-sm'>
        <div className='flex items-center justify-between p-2'>
          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-2'>
              {hasAdminFeedback ? (
                <CheckCircle className='h-4 w-4 text-green-600' />
              ) : (
                <CircleDashed className='h-4 w-4' />
              )}
              <span className='text-base font-semibold leading-none'>
                Feedback
              </span>
            </div>
            <div className='flex items-center'>
              <Button
                variant='ghost'
                size='sm'
                onClick={navigateToFeedback}
                className={
                  !chat?.is_valid && !chatPending ? 'text-amber-600' : ''
                }
              >
                <ExternalLink className='h-4 w-4' />
              </Button>
              {!chat?.is_valid && !chatPending && (
                <div className='ml-1 flex items-center gap-1 rounded-sm bg-yellow-50 p-1 text-xs text-amber-600'>
                  <AlertCircle className='h-3 w-3' />
                  <span>Invalid chat</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            aria-label='Close'
            onClick={() => {
              setFeedbackChatId(null)
              toggleRightPanel()
            }}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex-1 overflow-y-auto'>
          <FeedbackChatView feedbackChatId={feedbackChatId} />
        </div>
        <div className='flex items-center py-2'>
          <FeedbackChatInput />
        </div>
      </div>
    </div>
  )
}
