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

interface DataTableColumnMenuProps {
  columnKey: string
  column: any
  sort: ColumnSort | undefined
  sortedColumns: ColumnSort[]
  setSortedColumns: (columns: ColumnSort[]) => void
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
}) => {
  const setColumnSorting = useCallback(
    (column: string, direction: 'asc' | 'desc') => {
      console.log('setColumnSorting', column, direction)
      const index = sortedColumns.findIndex((c) => c.column === column)
      if (index !== -1) {
        const newColumns = [...sortedColumns]
        newColumns[index].direction = direction
        setSortedColumns(newColumns)
      } else {
        setSortedColumns([...sortedColumns, { column, direction }])
      }
    },
    [sortedColumns, setSortedColumns],
  )

  const clearColumnSorting = useCallback(
    (column: string) => {
      const index = sortedColumns.findIndex((c) => c.column === column)
      if (index !== -1) {
        const newColumns = [...sortedColumns]
        newColumns.splice(index, 1)
        setSortedColumns(newColumns)
      }
    },
    [sortedColumns],
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
            navigator.clipboard.writeText(columnKey)
            toast('Column ID copied to clipboard')
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
