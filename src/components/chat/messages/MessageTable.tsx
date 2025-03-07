import useSize from '@react-hook/size'
import {
  Column,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { Button } from 'components/Button'
import { Skeleton } from 'components/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/Table'
import { API_URL } from 'lib/constants'
import { useLayoutStore } from 'lib/stores/layout'
import { getAccount } from 'lib/stores/user'
import { replaceAll } from 'lib/utils/string'
import { getAuthHeaders } from 'lib/utils/token'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import DataTableColumnMenu, { ColumnSort } from './DataTableColumnMenu'
import { DataTablePagination } from './DataTablePagination'
import DataTableToolbar from './DataTableToolbar'

interface Props {
  messageId: string
  sql: string | undefined | null
  streaming?: boolean
}

interface DataColumn {
  header: string | (({ column }: { column: Column<never, unknown> }) => any)
  accessorKey: string
}

export type TableViewMode = 'default' | 'full' | 'wide'

const MessageTable: React.FC<Props> = memo(
  ({ messageId, sql, streaming }) => {
    const [columns, setColumns] = useState<DataColumn[]>([])
    const [data, setData] = useState([])
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [totalRowCount, setTotalRowCount] = useState(0)
    const [sortedColumns, setSortedColumns] = useState<ColumnSort[]>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {},
    )
    const { viewportWidth } = useLayoutStore()
    const tableRef = useRef<HTMLDivElement>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const tableContainerSize = useSize(tableContainerRef)
    const [offsetLeft, setOffsetLeft] = useState(0)
    const [tableViewMode, setTableViewMode] = useState<TableViewMode>('default')
    const [selectedCellId, setSelectedCellId] = useState<string>('')
    const loadingTypeRef = useRef<'paginating' | 'refreshing'>('refreshing')
    const [isLoading, setIsLoading] = useState(false)

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

    const serializeColumnsSorting = (columns: ColumnSort[]) => {
      return columns
        .map(
          (column) =>
            `${column.direction === 'desc' ? '-' : ''}${column.column}`,
        )
        .join(',')
    }

    const toggleColumnSorting = useCallback(
      (column: string) => {
        const index = sortedColumns.findIndex((c) => c.column === column)
        if (index !== -1) {
          //Remove if sorting is descending
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

    const refreshTableData = async () => {
      setIsLoading(true)
      try {
        await fetch(
          `${API_URL}/v3/orgs/${getAccount()}/messages/${messageId}/refresh`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: getAuthHeaders(),
          },
        )
        await getTableData()
      } catch (e: any) {
        console.error(e.message)
        setIsLoading(false)
      }
    }

    const getTableData = useCallback(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `${API_URL}/v3/orgs/${getAccount()}/messages/${messageId}/data?limit=${rowsPerPage}&skip=${currentPageIndex * rowsPerPage}&sort=${serializeColumnsSorting(sortedColumns)}`,
          {
            credentials: 'include',
            headers: getAuthHeaders(),
          },
        )
        const data = await response.json()
        setData(data.data)
        setTotalRowCount(data.total)
        setColumns(
          Object.keys(data.data[0]).map((key) => ({
            header: ({ column }) => {
              const sort = sortedColumns.find((c) => c.column === key)
              return (
                <div className='group/header flex items-center gap-2'>
                  <button
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
                    <DataTableColumnMenu
                      columnKey={key}
                      column={column}
                      setSortedColumns={setSortedColumns}
                      sortedColumns={sortedColumns}
                      sort={sort}
                      setLoadingType={() =>
                        (loadingTypeRef.current = 'refreshing')
                      }
                    />
                  </div>
                </div>
              )
            },
            accessorKey: key,
          })),
        )
      } catch (e: any) {
        console.error(e.message)
      }
      setIsLoading(false)
    }, [
      messageId,
      rowsPerPage,
      currentPageIndex,
      sortedColumns,
      toggleColumnSorting,
    ])

    const handleDownload = useCallback(async () => {
      const response = await fetch(
        `${API_URL}/v3/orgs/${getAccount()}/messages/${messageId}/data/csv`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'text/csv',
            ...getAuthHeaders(),
          },
        },
      )
      const blob = await response.blob()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `export.csv`)

      document.body.appendChild(link)

      link.click()

      link.parentNode?.removeChild(link)
    }, [messageId])

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
      <div className='max-w-full flex-1' ref={tableRef}>
        <div
          ref={tableContainerRef}
          className={`flex flex-1 flex-col ${tableViewMode === 'full'
            ? 'fixed bottom-0 left-0 right-0 top-0 z-10 h-full min-h-fit overflow-y-auto bg-white'
            : ''
            }`}
          style={{
            marginLeft: tableViewMode === 'wide' ? -offsetLeft + 28 : 0,
            width: tableViewMode === 'wide' ? viewportWidth - 64 : '',
          }}
        >
          <DataTableToolbar
            onRefreshButtonClick={() => {
              loadingTypeRef.current = 'refreshing'
              refreshTableData()
            }}
            messageId={messageId}
            isRefreshing={isLoading && loadingTypeRef.current === 'refreshing'}
            sql={sql ?? ''}
            handleDownload={handleDownload}
            table={table}
            tableViewMode={tableViewMode}
            setTableViewMode={setTableViewMode}
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
                    {headerGroup.headers.map((header, index) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={`h-9 whitespace-nowrap border border-border bg-[#F5F5F5] text-sm text-primary`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </TableHead>
                      )
                    })}
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
                    .map((row, rowIndex) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell, columnIndex) => (
                          <TableCell
                            key={cell.id}
                            className={`h-[34px] whitespace-nowrap border border-border text-primary/75 ${selectedCellId === cell.id ? 'shadow-[inset_0px_0px_0px_1px_#000]' : 'border-border'}`}
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
                      <TableHead
                        className={`h-9 whitespace-nowrap border border-border bg-[#F5F5F5] px-3 py-2 text-sm text-foreground`}
                      >
                        <Skeleton className='h-full w-48 rounded-sm bg-[#DFDFDF]' />
                      </TableHead>
                      <TableHead
                        className={`h-9 w-full whitespace-nowrap border border-border bg-[#F5F5F5] px-3 py-2 text-sm text-foreground`}
                      >
                        <Skeleton className='h-full w-48 rounded-sm bg-[#DFDFDF]' />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        key={1}
                        className='h-[34px] border border-border text-center'
                      ></TableCell>
                      <TableCell
                        key={2}
                        className='h-[34px] border border-border text-center'
                      ></TableCell>
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
          {totalRowCount > rowsPerPage && (
            <DataTablePagination
              totalRowCount={totalRowCount}
              currentStartIndex={currentPageIndex * rowsPerPage}
              rowsPerPage={rowsPerPage}
              onPreviousPage={onPreviousPage}
              onNextPage={onNextPage}
              onFirstPage={onFirstPage}
              onLastPage={onLastPage}
              paginating={isLoading && loadingTypeRef.current === 'paginating'}
            />
          )}
        </div>
      </div>
    )
  },
)

export default MessageTable
