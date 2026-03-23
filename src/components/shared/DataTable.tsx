'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 20, 30] as const

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  mobileLabel?: ReactNode | false
  mobilePlacement?: 'top' | 'body' | 'footer'
}

type LegacyProps = {
  headers: ReactNode[]
  children: ReactNode
}

type GenericProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  searchKey?: keyof T
  loading?: boolean
  emptyMessage?: string
}

function isLegacyProps<T>(props: LegacyProps | GenericProps<T>): props is LegacyProps {
  return 'headers' in props
}

export function DataTable<T>(props: LegacyProps | GenericProps<T>) {
  if (isLegacyProps(props)) {
    return <LegacyDataTable headers={props.headers}>{props.children}</LegacyDataTable>
  }

  return <GenericDataTable {...props} />
}

function LegacyDataTable({ headers, children }: { headers: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <table className="w-full min-w-[720px] text-xs sm:text-sm md:min-w-[900px]">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-3 py-2 text-left font-medium text-muted-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function getColumnLabel(header: ReactNode) {
  if (typeof header === 'string' || typeof header === 'number') {
    return String(header)
  }

  return ''
}

function getMobileColumnLabel<T>(column: DataTableColumn<T>) {
  if (column.mobileLabel === false) {
    return ''
  }

  if (typeof column.mobileLabel === 'string' || typeof column.mobileLabel === 'number') {
    return String(column.mobileLabel)
  }

  return getColumnLabel(column.header)
}

function GenericDataTable<T>({ columns, data, searchKey, loading, emptyMessage = 'No records found.' }: GenericProps<T>) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const topColumns = columns.filter((column) => column.mobilePlacement === 'top')
  const labeledColumns = columns.filter((column) => column.mobilePlacement !== 'top' && getMobileColumnLabel(column))
  const actionColumns = columns.filter((column) => column.mobilePlacement === 'footer' || (column.mobilePlacement !== 'top' && !getMobileColumnLabel(column)))

  const filteredData = useMemo(() => {
    if (!searchKey || !query.trim()) return data
    return data.filter((row) => String(row[searchKey] ?? '').toLowerCase().includes(query.toLowerCase()))
  }, [data, query, searchKey])

  const pageCount = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-3">
      {searchKey ? (
        <Input
          placeholder={`Search by ${String(searchKey)}`}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <div className="md:hidden">
          {loading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: Math.min(pageSize, 4) }).map((_, index) => (
                <div key={`mobile-skeleton-${index}`} className="rounded-lg border bg-background p-3">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : pageData.length > 0 ? (
            <div className="space-y-3 p-3">
              {pageData.map((row, rowIndex) => (
                <div key={`mobile-row-${rowIndex}`} className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="space-y-3">
                    {topColumns.length ? (
                      <div className="space-y-2">
                        {topColumns.map((column) => (
                          <div key={column.key}>{column.render(row)}</div>
                        ))}
                      </div>
                    ) : null}

                    {labeledColumns.map((column) => {
                      const label = getMobileColumnLabel(column)
                      const content = column.render(row)

                      return (
                        <div key={column.key} className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3">
                          <div className="pt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {label}
                          </div>
                          <div className="min-w-0 text-right break-words">{content}</div>
                        </div>
                      )
                    })}

                    {actionColumns.length ? (
                      <div className="flex justify-end border-t pt-2">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {actionColumns.map((column) => (
                            <div key={column.key}>{column.render(row)}</div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          )}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: pageSize }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={columns.length}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : pageData.length > 0
                  ? pageData.map((row, rowIndex) => (
                      <TableRow key={`row-${rowIndex}`}>
                        {columns.map((column) => (
                          <TableCell key={column.key}>{column.render(row)}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 whitespace-nowrap sm:hidden">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 min-w-14 px-2"
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="size-4" />
            <span>Prev</span>
          </Button>

          <span className="min-w-0 text-center text-xs text-muted-foreground">
            {currentPage}/{pageCount}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 min-w-14 px-2"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          >
            <span>Next</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-18 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden items-center justify-end gap-2 sm:flex">
        <span className="text-xs text-muted-foreground">Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            setPageSize(Number(value))
            setPage(1)
          }}
        >
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {currentPage} of {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= pageCount}
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
