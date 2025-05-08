import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '../../atoms/Button'
import { Spinner } from '../../atoms/Spinner'

interface MessageTablePaginationProps {
  totalRowCount: number
  currentStartIndex: number
  rowsPerPage: number
  onPreviousPage: () => void
  onNextPage: () => void
  onFirstPage: () => void
  onLastPage: () => void
  paginating: boolean
}

export function MessageTablePagination({
  totalRowCount,
  currentStartIndex,
  rowsPerPage,
  onPreviousPage,
  onNextPage,
  onFirstPage,
  onLastPage,
  paginating,
}: MessageTablePaginationProps) {
  const isFirstPage = currentStartIndex === 0
  const isLastPage = currentStartIndex + rowsPerPage >= totalRowCount

  return (
    <div className='flex items-center justify-between gap-2 py-2'>
      <div className='flex-1' />
      {paginating && <Spinner size={0.4} />}
      <div className='flex items-center gap-2'>
        <div className='text-foreground/75 flex items-center justify-center text-sm font-medium'>
          {currentStartIndex + 1}-
          {Math.min(currentStartIndex + rowsPerPage, totalRowCount)} of{' '}
          {totalRowCount}
        </div>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={onFirstPage}
            disabled={isFirstPage}
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={onPreviousPage}
            disabled={isFirstPage}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={onNextPage}
            disabled={isLastPage}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            onClick={onLastPage}
            disabled={isLastPage}
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
