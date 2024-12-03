import { Button, TooltipButton } from 'components/Button'
import {
  Download,
  Eye,
  Maximize,
  RectangleHorizontal,
  RefreshCcw,
  Square,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import CodeSheet from '../messages/CodeSheet'
import { Table } from '@tanstack/react-table'
import Spinner from 'components/Spinner'
import { TableViewMode } from './MessageTable'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'components/Dropdown'

interface DataTableToolbarProps {
  getTableData: () => void
  table: Table<never>
  sql: string
  handleDownload: () => Promise<void>
  tableViewMode: string
  setTableViewMode: (mode: TableViewMode) => void
  isRefreshing: boolean
}

const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  getTableData,
  table,
  sql,
  handleDownload,
  tableViewMode,
  setTableViewMode,
  isRefreshing,
}) => {
  return (
    <div className='flex items-center gap-2 py-2'>
      <div className='flex-1' />
      {isRefreshing ? (
        <div className='flex items-center gap-2 leading-none'>
          <Spinner size='18' />
          Fetching data...
        </div>
      ) : (
        <TooltipButton
          size='icon'
          variant='ghost'
          onClick={() => getTableData()}
          tooltip='Refresh'
        >
          <RefreshCcw />
        </TooltipButton>
      )}

      {table.getRowModel().rows?.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='h-8 p-2'>
            <TooltipButton
              variant='ghost'
              className='ml-auto flex gap-2'
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
      <CodeSheet code={sql ?? ''} language='SQL' />

      <TooltipButton
        size='icon'
        variant='ghost'
        onClick={() => {
          toast.promise(handleDownload, {
            loading: 'Downloading csv...',
            success: (data) => {
              return `Download complete`
            },
            error: 'Error downloading csv',
          })
        }}
        tooltip='Download CSV'
      >
        <Download />
      </TooltipButton>
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

export default DataTableToolbar
