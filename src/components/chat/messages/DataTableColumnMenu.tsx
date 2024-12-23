import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'components/Dropdown'
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
import copy from 'copy-to-clipboard'

interface DataTableColumnMenuProps {
  columnKey: string
  column: any
  sort: ColumnSort | undefined
  sortedColumns: ColumnSort[]
  setSortedColumns: (columns: ColumnSort[]) => void
  setLoadingType: () => void
}

export interface ColumnSort {
  column: string
  direction: 'asc' | 'desc'
}

const DataTableColumnMenu: React.FC<DataTableColumnMenuProps> = ({
  column,
  columnKey,
  sort,
  sortedColumns,
  setSortedColumns,
  setLoadingType,
}) => {
  const setColumnSorting = useCallback(
    (column: string, direction: 'asc' | 'desc') => {
      setLoadingType()
      setSortedColumns([{ column, direction }])
    },
    [setLoadingType, setSortedColumns],
  )

  const clearColumnSorting = useCallback(
    (column: string) => {
      setLoadingType()
      const index = sortedColumns.findIndex((c) => c.column === column)
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

export default DataTableColumnMenu
