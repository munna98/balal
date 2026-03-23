'use client'

import Link from 'next/link'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'

export type SaleRow = {
  id: string
  customerName: string
  customerMobile1: string
  deviceName: string
  imei: string | null
  loanAmount: number
  emiAmount: number
  tenureMonths: number
  loanIssueDate: string // ISO string
  balance: number
}

export function SalesDataTable({ rows }: { rows: SaleRow[] }) {
  const columns: DataTableColumn<SaleRow>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div>
          <Link href={`/sales/${row.id}`} className="font-medium underline-offset-4 hover:underline">
            {row.customerName}
          </Link>
          <div className="text-xs text-muted-foreground">{row.customerMobile1}</div>
        </div>
      ),
    },
    { key: 'device', header: 'Device', render: (row) => row.deviceName },
    { key: 'imei', header: 'IMEI', render: (row) => row.imei || '-' },
    {
      key: 'loan',
      header: 'Loan',
      render: (row) => row.loanAmount.toFixed(2),
    },
    {
      key: 'emi',
      header: 'EMI',
      render: (row) => row.emiAmount.toFixed(2),
    },
    { key: 'tenure', header: 'Tenure', render: (row) => `${row.tenureMonths} months` },
    {
      key: 'date',
      header: 'Date',
      render: (row) => new Date(row.loanIssueDate).toLocaleDateString(),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => (
        <span className={row.balance > 0 ? 'text-red-600' : 'text-green-600'}>{row.balance.toFixed(2)}</span>
      ),
    },
  ]

  return <DataTable columns={columns} data={rows} emptyMessage="No sales found." />
}

