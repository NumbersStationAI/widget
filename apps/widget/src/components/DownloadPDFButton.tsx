import download from 'downloadjs'
import { toast } from 'sonner'

import { getChatSummaryPdf } from '@ns/public-api'
import { Button } from '@ns/ui/atoms/Button'
import { DEFAULT_CONVERSATION_NAME } from '@ns/ui/utils/constants'

import PDF from 'lib/icons/pdf.svg?react'
import { useChatStore } from 'lib/stores/chat'
import { getAccount } from 'lib/stores/user'

export function DownloadPDFButton({ messageId }: { messageId: string }) {
  const { currentChat } = useChatStore()
  const onClick = async () => {
    const data = await getChatSummaryPdf(
      { accountName: getAccount(), messageId },
      { responseType: 'blob' },
    )
    download(
      data as Blob,
      `${currentChat?.name ?? DEFAULT_CONVERSATION_NAME} Summary ${new Date().toLocaleString()}.pdf`,
      'application/pdf',
    )
  }
  return (
    <Button
      size='sm'
      variant='outline'
      className='self-start'
      onClick={() => {
        toast.promise(onClick, {
          loading: 'Downloading PDF...',
          success: 'Download complete',
          error: 'Error downloading PDF',
        })
      }}
    >
      <PDF className='h-5 w-5' />
      Download PDF
    </Button>
  )
}
