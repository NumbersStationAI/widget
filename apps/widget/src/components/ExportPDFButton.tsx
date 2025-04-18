import download from 'downloadjs'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { getDeepResearchSummaryPdf } from '@ns/public-api'

import { Button } from 'components/Button'
import { useChatStore } from 'lib/stores/chat'
import { getAccount } from 'lib/stores/user'

export function ExportPDFButton({ messageId }: { messageId: string }) {
  const { currentChat } = useChatStore()
  const onClick = async () => {
    const data = await getDeepResearchSummaryPdf(
      { accountName: getAccount(), messageId },
      { responseType: 'blob' },
    )
    download(
      data as Blob,
      `${currentChat?.name ?? 'Deep Research'} Summary.pdf`,
      'application/pdf',
    )
  }
  return (
    <Button
      variant='ghost'
      className='flex h-auto items-center gap-2 px-4 py-2 text-base'
      onClick={() => {
        toast.promise(onClick, {
          loading: 'Downloading PDF...',
          success: 'Download complete',
          error: 'Error downloading PDF',
        })
      }}
    >
      <ExternalLink className='h-5 w-5' />
      Export PDF
    </Button>
  )
}
