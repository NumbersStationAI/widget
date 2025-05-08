import useSize from '@react-hook/size'
import {
  type Column,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { type DataPage, readMessageTableData } from '@ns/public-api'

import { Button } from '../../atoms/Button'
import { Skeleton } from '../../atoms/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table'
import { cn } from '../../utils/cn'
import { replaceAll } from '../../utils/replaceAll'

import {
  type ColumnSort,
  MessageTableColumnMenu,
} from './MessageTableColumnMenu'
import { MessageTablePagination } from './MessageTablePagination'
/* eslint-disable-next-line import/no-cycle */
import { MessageTableToolbar } from './MessageTableToolbar'

export type MessageTableProps = {
  accountName: string
  messageId: string
  sql: string | null | undefined
  viewportWidth: number | undefined
  className?: string
  children?: React.ReactNode
}

type RowT = Record<string, unknown>

type DataColumn = {
  header:
    | string
    | (({ column }: { column: Column<RowT, unknown> }) => React.ReactNode)
  accessorKey: string
}

export type TableViewMode = 'default' | 'full' | 'wide'

export const MessageTable = memo<MessageTableProps>(
  ({ accountName, messageId, sql, viewportWidth, className, children }) => {
    const [columns, setColumns] = useState<DataColumn[]>([])
    const [dataResponse, setDataResponse] = useState<DataPage>()
    const [formatData, setFormatData] = useState(true)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [totalRowCount, setTotalRowCount] = useState(0)
    const [sortedColumns, setSortedColumns] = useState<ColumnSort[]>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {},
    )
    const tableRef = useRef<HTMLDivElement>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const tableContainerSize = useSize(tableContainerRef)
    const [offsetLeft, setOffsetLeft] = useState(0)
    const [tableViewMode, setTableViewMode] = useState<TableViewMode>('default')
    const [selectedCellId, setSelectedCellId] = useState<string>('')
    const loadingTypeRef = useRef<'paginating' | 'refreshing'>('refreshing')
    const [isLoading, setIsLoading] = useState(false)

    const data = useMemo(
      () =>
        ((formatData ? dataResponse?.data : dataResponse?.raw_data) ??
          []) as RowT[],
      [formatData, dataResponse],
    )
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      state: {
        columnVisibility,
      },
    })

    useEffect(() => {
      setOffsetLeft(tableRef.current?.offsetLeft || 0)
    }, [viewportWidth, tableViewMode])

    const getSorts = (cols: ColumnSort[]) =>
      cols.map((c) => `${c.direction === 'desc' ? '-' : ''}${c.column}`)

    const toggleColumnSorting = useCallback(
      (column: string) => {
        const index = sortedColumns.findIndex((c) => c.column === column)
        if (index !== -1) {
          // Remove if sorting is descending
          if (sortedColumns[index].direction === 'desc') {
            setSortedColumns([])
          } else {
            setSortedColumns([
              {
                column,
                direction:
                  sortedColumns[index].direction === 'asc' ? 'desc' : 'asc',
              },
            ])
          }
        } else {
          setSortedColumns([{ column, direction: 'asc' }])
        }
      },
      [sortedColumns],
    )

    const getTableData = useCallback(async () => {
      try {
        setIsLoading(true)
        const response = await readMessageTableData({
          accountName,
          messageId,
          params: {
            limit: rowsPerPage,
            skip: currentPageIndex * rowsPerPage,
            sort: getSorts(sortedColumns),
          },
        })
        setDataResponse(response)
        setTotalRowCount(response.total)
        /* eslint-disable react/no-unstable-nested-components */
        setColumns(
          Object.keys(response.data[0] as RowT).map((key) => ({
            header: ({ column }) => {
              const sort = sortedColumns.find((c) => c.column === key)
              return (
                <div className='group/header flex items-center gap-2'>
                  <button
                    type='button'
                    className='flex flex-1 items-center justify-start gap-2'
                    onClick={() => {
                      loadingTypeRef.current = 'refreshing'
                      toggleColumnSorting(key)
                    }}
                  >
                    {replaceAll(key, '_', ' ')}
                    {sort &&
                      (sort?.direction === 'asc' ? (
                        <ArrowUp className='h-4 w-4' />
                      ) : (
                        <ArrowDown className='h-4 w-4' />
                      ))}
                    <div className='flex-1' />
                  </button>
                  <div className='flex h-full items-center opacity-0 group-hover/header:opacity-100'>
                    <MessageTableColumnMenu
                      columnKey={key}
                      column={column}
                      setSortedColumns={setSortedColumns}
                      sortedColumns={sortedColumns}
                      sort={sort}
                      setLoadingType={() => {
                        loadingTypeRef.current = 'refreshing'
                      }}
                    />
                  </div>
                </div>
              )
            },
            accessorKey: key,
          })),
        )
        /* eslint-enable react/no-unstable-nested-components */
      } finally {
        setIsLoading(false)
      }
    }, [
      accountName,
      messageId,
      rowsPerPage,
      currentPageIndex,
      sortedColumns,
      toggleColumnSorting,
    ])

    useEffect(() => {
      getTableData()
    }, [currentPageIndex, getTableData, rowsPerPage])

    const onFirstPage = useCallback(() => {
      loadingTypeRef.current = 'paginating'
      setCurrentPageIndex(0)
    }, [])

    const onLastPage = useCallback(() => {
      loadingTypeRef.current = 'paginating'
      const lastPageIndex = Math.floor((totalRowCount - 1) / rowsPerPage)
      setCurrentPageIndex(lastPageIndex)
    }, [totalRowCount, rowsPerPage])

    const onPreviousPage = useCallback(() => {
      if (currentPageIndex === 0) return
      loadingTypeRef.current = 'paginating'
      setCurrentPageIndex(currentPageIndex - 1)
    }, [currentPageIndex])

    const onNextPage = useCallback(() => {
      if (currentPageIndex * rowsPerPage >= totalRowCount) return
      loadingTypeRef.current = 'paginating'
      setCurrentPageIndex(currentPageIndex + 1)
    }, [currentPageIndex, totalRowCount, rowsPerPage])

    useEffect(() => {
      const currentStartRowIndex = currentPageIndex * rowsPerPage
      if (tableViewMode === 'full') {
        const cellHeight = 36
        const headerHeight = 36
        const toolbarHeight = 48
        const footerHeight = 48
        const borderHeight = 1

        const tableHeight =
          tableContainerSize[1] -
          headerHeight -
          toolbarHeight -
          footerHeight -
          borderHeight * 2

        unstable_batchedUpdates(() => {
          const newRowsPerPage = Math.floor(
            tableHeight / (cellHeight + borderHeight),
          )
          setCurrentPageIndex(Math.floor(currentStartRowIndex / newRowsPerPage))
          setRowsPerPage(newRowsPerPage)
        })
      } else {
        unstable_batchedUpdates(() => {
          const newRowsPerPage = 10
          setCurrentPageIndex(Math.floor(currentStartRowIndex / newRowsPerPage))
          setRowsPerPage(newRowsPerPage)
        })
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableContainerSize])
    return (
      <div className={cn('max-w-full flex-1', className)} ref={tableRef}>
        <div
          ref={tableContainerRef}
          className={cn(
            'flex flex-1 flex-col',
            tableViewMode === 'full' &&
              'fixed bottom-0 left-0 right-0 top-0 z-10 h-full min-h-fit overflow-y-auto bg-white',
          )}
          style={{
            marginLeft: tableViewMode === 'wide' ? -offsetLeft + 28 : 0,
            width: tableViewMode === 'wide' ? (viewportWidth ?? 0) - 64 : '',
          }}
        >
          <MessageTableToolbar
            accountName={accountName}
            messageId={messageId}
            sql={sql}
            isPending={isLoading && loadingTypeRef.current === 'refreshing'}
            table={table}
            tableViewMode={tableViewMode}
            setTableViewMode={setTableViewMode}
            showTableViewModeToggle={viewportWidth != null}
            onFormatButtonClick={() => setFormatData((prev) => !prev)}
            isFormatted={formatData}
          />
          <div
            className={`relative max-w-full overflow-hidden ${tableViewMode !== 'full' ? 'rounded-md' : ''}`}
          >
            {tableViewMode !== 'full' && (
              <div className='pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 rounded-md bg-transparent shadow-[inset_0px_0px_0px_1px_hsl(var(--border))]' />
            )}

            <Table className=''>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className='border-border text-primary h-9 whitespace-nowrap border bg-[#F5F5F5] text-sm'
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              {table.getRowModel().rows?.length &&
              table.getAllColumns().filter((column) => column.getIsVisible())
                .length ? (
                <TableBody>
                  {table
                    .getRowModel()
                    .rows.slice(0, rowsPerPage)
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`border-border text-primary/75 h-[34px] whitespace-nowrap border ${selectedCellId === cell.id ? 'shadow-[inset_0px_0px_0px_1px_#000]' : 'border-border'}`}
                            onClick={() =>
                              selectedCellId === cell.id
                                ? setSelectedCellId('')
                                : setSelectedCellId(cell.id)
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              ) : isLoading ? (
                <>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='border-border text-foreground h-9 whitespace-nowrap border bg-[#F5F5F5] px-3 py-2 text-sm'>
                        <Skeleton className='h-full w-48 rounded-sm bg-[#DFDFDF]' />
                      </TableHead>
                      <TableHead className='border-border text-foreground h-9 w-full whitespace-nowrap border bg-[#F5F5F5] px-3 py-2 text-sm'>
                        <Skeleton className='h-full w-48 rounded-sm bg-[#DFDFDF]' />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        key={1}
                        className='border-border h-[34px] border text-center'
                      />
                      <TableCell
                        key={2}
                        className='border-border h-[34px] border text-center'
                      />
                    </TableRow>
                  </TableBody>
                </>
              ) : table
                  .getAllColumns()
                  .filter((column) => column.getIsVisible()).length === 0 &&
                table.getAllColumns().length > 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='flex h-28 flex-col items-center justify-center gap-2 text-center'
                    >
                      All columns are hidden.
                      <Button
                        onClick={() => {
                          table.toggleAllColumnsVisible(true)
                        }}
                      >
                        Reset columns
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </div>
          <div className='flex w-full items-center'>
            {children}
            <div className='flex-1'>
              {totalRowCount > rowsPerPage && (
                <MessageTablePagination
                  totalRowCount={totalRowCount}
                  currentStartIndex={currentPageIndex * rowsPerPage}
                  rowsPerPage={rowsPerPage}
                  onPreviousPage={onPreviousPage}
                  onNextPage={onNextPage}
                  onFirstPage={onFirstPage}
                  onLastPage={onLastPage}
                  paginating={
                    isLoading && loadingTypeRef.current === 'paginating'
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)
