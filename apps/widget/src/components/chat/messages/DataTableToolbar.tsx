import { type Table } from '@tanstack/react-table'
import download from 'downloadjs'
import {
  Download,
  Eye,
  Maximize,
  RectangleHorizontal,
  RemoveFormatting,
  Square,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { readMessageTableDataAsCsv } from '@ns/public-api'

import { Button, TooltipButton } from 'components/Button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'components/Dropdown'
import { Spinner } from 'components/Spinner'
import { useChatStore } from 'lib/stores/chat'
import { getAccount } from 'lib/stores/user'

import { CodeSheet } from './CodeSheet'
/* eslint-disable-next-line import/no-cycle */
import { ExplanationSheet } from './ExplanationSheet'
import { useMessage } from './MessageContext'
import { type TableViewMode } from './MessageTable'

type DataTableToolbarProps = {
  table: Table<Record<string, unknown>>
  tableViewMode: string
  setTableViewMode: (mode: TableViewMode) => void
  isPending: boolean
  onFormatButtonClick: () => void
  isFormatted: boolean
  isPopoverFeedbackChat?: boolean
}

export function DataTableToolbar({
  table,
  tableViewMode,
  setTableViewMode,
  isPending,
  onFormatButtonClick,
  isFormatted,
  isPopoverFeedbackChat,
}: DataTableToolbarProps) {
  const { message } = useMessage()
  return (
    <div className='flex items-center gap-2 py-2'>
      <div className='flex-1' />
      {isPending && (
        <div className='flex items-center gap-3 text-sm leading-none text-primary'>
          <Spinner size={0.4} />
          Fetching data...
        </div>
      )}

      {table.getRowModel().rows?.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='h-8'>
            <TooltipButton
              size='icon'
              variant='ghost'
              className='ml-auto flex'
              tooltip='Hide columns'
            >
              <Eye />
            </TooltipButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='max-h-[24rem] overflow-y-auto'
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: any) =>
                      column.toggleVisibility(value)
                    }
                  >
                    {column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <TooltipButton
        size='icon'
        variant={isFormatted ? 'ghost' : 'default'}
        onClick={onFormatButtonClick}
        tooltip={isFormatted ? 'Remove formatting' : 'Format'}
      >
        <RemoveFormatting />
      </TooltipButton>
      <ExplanationSheet messageId={message.id} />
      <CodeSheet code={message.sql ?? ''} language='SQL' />
      <DownloadCSVButton />
      {tableViewMode === 'default' && (
        <TooltipButton
          size='icon'
          variant='ghost'
          className='hidden md:flex'
          onClick={() => {
            setTableViewMode('wide')
            // setShowSidebar(false)
          }}
          tooltip='Expand view'
        >
          <RectangleHorizontal />
        </TooltipButton>
      )}
      {(tableViewMode === 'wide' || tableViewMode === 'full') && (
        <TooltipButton
          size='icon'
          variant='ghost'
          className='hidden md:flex'
          onClick={() => setTableViewMode('default')}
          tooltip='Center view'
        >
          <Square />
        </TooltipButton>
      )}
      {(tableViewMode === 'default' || tableViewMode === 'wide') && (
        <TooltipButton
          size='icon'
          variant='ghost'
          className='hidden md:flex'
          onClick={() => setTableViewMode('full')}
          tooltip='Full screen'
        >
          <Maximize />
        </TooltipButton>
      )}
      {tableViewMode === 'full' && (
        <Button
          size='icon'
          variant='ghost'
          className='hidden md:flex'
          onClick={() => setTableViewMode('default')}
        >
          <X />
        </Button>
      )}
    </div>
  )
}

function DownloadCSVButton() {
  const { currentChat } = useChatStore()
  const { message } = useMessage()
  const onClick = async () => {
    const data = await readMessageTableDataAsCsv(
      { accountName: getAccount(), messageId: message.id },
      { responseType: 'blob' },
    )
    download(data as Blob, `${currentChat?.name ?? 'export'}.csv`, 'text/csv')
  }
  return (
    <TooltipButton
      size='icon'
      variant='ghost'
      tooltip='Download CSV'
      onClick={() => {
        toast.promise(onClick, {
          loading: 'Downloading CSV...',
          success: 'Download complete',
          error: 'Error downloading CSV',
        })
      }}
    >
      <Download />
    </TooltipButton>
  )
}
