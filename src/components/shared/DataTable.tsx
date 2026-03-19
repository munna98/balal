'use client'

import { useMemo, useState, type ReactNode } from 'react'
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

const PAGE_SIZE = 10

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
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
      <table className="w-full min-w-[900px] text-sm">
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

function GenericDataTable<T>({ columns, data, searchKey, loading, emptyMessage = 'No records found.' }: GenericProps<T>) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredData = useMemo(() => {
    if (!searchKey || !query.trim()) return data
    return data.filter((row) => String(row[searchKey] ?? '').toLowerCase().includes(query.toLowerCase()))
  }, [data, query, searchKey])

  const pageCount = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
              ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
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

      <div className="flex items-center justify-end gap-2">
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
