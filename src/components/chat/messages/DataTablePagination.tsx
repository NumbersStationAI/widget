import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button } from 'components/Button'
import Spinner from 'components/Spinner'

interface DataTablePaginationProps {
  totalRowCount: number
  currentStartIndex: number
  rowsPerPage: number
  onPreviousPage: () => void
  onNextPage: () => void
  paginating: boolean
}

export function DataTablePagination({
  totalRowCount,
  currentStartIndex,
  rowsPerPage,
  onPreviousPage,
  onNextPage,
  paginating,
}: DataTablePaginationProps) {
  return (
    <div className='flex items-center justify-between gap-4 py-2'>
      <div className='flex-1' />
      {paginating && <Spinner size='18' />}
      <div className='flex items-center gap-4'>
        <div className='flex items-center justify-center text-sm font-medium text-foreground/75'>
          {currentStartIndex + 1}-
          {Math.min(currentStartIndex + rowsPerPage, totalRowCount)} of{' '}
          {totalRowCount}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={() => onPreviousPage()}
            disabled={currentStartIndex === 0}
          >
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={() => onNextPage()}
            disabled={currentStartIndex + rowsPerPage >= totalRowCount}
          >
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
