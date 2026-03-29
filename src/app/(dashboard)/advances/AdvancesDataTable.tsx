'use client'

import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { formatLocaleDate } from '@/lib/format-date'
import { MarkRepaymentDialog } from '@/components/advances/MarkRepaymentDialog'

export type AdvanceRow = {
  id: string
  customerName: string
  deviceName: string
  paidDate: string // ISO
  /** Whole calendar days from paid date to today (local calendar dates). */
  ageDays: number
  paidByShop: number
  repaidAmount: number | null
  balance: number
  note: string | null
}

export function AdvancesDataTable({ rows }: { rows: AdvanceRow[] }) {
  const columns: DataTableColumn<AdvanceRow>[] = [
    { key: 'customerName', header: 'Customer', render: (row) => row.customerName },
    { key: 'deviceName', header: 'Device', render: (row) => row.deviceName },
    {
      key: 'paidDate',
      header: 'Date',
      render: (row) => formatLocaleDate(row.paidDate),
    },
    {
      key: 'ageDays',
      header: 'Age (days)',
      render: (row) => row.ageDays.toString(),
    },
    {
      key: 'paidByShop',
      header: 'Paid by shop',
      render: (row) => row.paidByShop.toFixed(2),
    },
    {
      key: 'repaidAmount',
      header: 'Repaid',
      render: (row) => (row.repaidAmount == null ? '-' : row.repaidAmount.toFixed(2)),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => (
        <span className={row.balance > 0 ? 'text-red-600' : 'text-green-600'}>{row.balance.toFixed(2)}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <MarkRepaymentDialog advance={{ id: row.id, note: row.note }} />,
    },
  ]

  return <DataTable columns={columns} data={rows} emptyMessage="No advances found." />
}

