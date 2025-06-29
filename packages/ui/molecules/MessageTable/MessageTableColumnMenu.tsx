import { type Column } from '@tanstack/react-table'
import copy from 'copy-to-clipboard'
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChevronDown,
  Copy,
  EyeOff,
} from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../atoms/DropdownMenu'

export interface MessageTableColumnMenuProps<RowT> {
  columnKey: string
  column: Column<RowT, unknown>
  sort: ColumnSort | undefined
  sortedColumns: ColumnSort[]
  setSortedColumns: (columns: ColumnSort[]) => void
  setLoadingType: () => void
}

export interface ColumnSort {
  column: string
  direction: 'asc' | 'desc'
}

export function MessageTableColumnMenu<RowT>({
  column,
  columnKey,
  sort,
  sortedColumns,
  setSortedColumns,
  setLoadingType,
}: MessageTableColumnMenuProps<RowT>) {
  const setColumnSorting = useCallback(
    (col: string, direction: 'asc' | 'desc') => {
      setLoadingType()
      setSortedColumns([{ column: col, direction }])
    },
    [setLoadingType, setSortedColumns],
  )

  const clearColumnSorting = useCallback(
    (col: string) => {
      setLoadingType()
      const index = sortedColumns.findIndex((c) => c.column === col)
      if (index !== -1) {
        setSortedColumns([])
      }
    },
    [setLoadingType, setSortedColumns, sortedColumns],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ChevronDown className='h-4 w-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!(sort && sort?.direction === 'asc') && (
          <DropdownMenuItem onClick={() => setColumnSorting(columnKey, 'asc')}>
            <ArrowUp />
            Sort ascending
          </DropdownMenuItem>
        )}
        {!(sort && sort?.direction === 'desc') && (
          <DropdownMenuItem onClick={() => setColumnSorting(columnKey, 'desc')}>
            <ArrowDown />
            Sort descending
          </DropdownMenuItem>
        )}
        {sort && (
          <DropdownMenuItem onClick={() => clearColumnSorting(columnKey)}>
            <ArrowDownUp />
            Clear sorting
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
          <EyeOff />
          Hide field
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (copy(columnKey)) {
              toast('Column ID copied to clipboard')
            } else {
              toast('Failed to copy to clipboard')
            }
          }}
        >
          <Copy />
          Copy column ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
