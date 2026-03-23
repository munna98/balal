'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { RiskBadge } from '@/components/customers/RiskBadge'

export type CustomerRow = {
  id: string
  name: string
  photo_url: string | null
  mobile1: string
  risk_level: 'DANGER' | 'WARNING' | 'NEUTRAL' | 'RELIABLE' | 'SAFE'
  salesCount: number
  balance: number
  search: string
}

export function CustomersDataTable({ customers }: { customers: CustomerRow[] }) {
  const columns: DataTableColumn<CustomerRow>[] = [
    {
      key: 'photo_url',
      header: 'Photo',
      render: (row) => (
        <Avatar className="size-8">
          {row.photo_url ? <AvatarImage src={row.photo_url} alt={row.name} /> : null}
          <AvatarFallback>Photo</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <Link href={`/customers/${row.id}`} className="font-medium underline-offset-4 hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'mobile1',
      header: 'Mobile',
      render: (row) => row.mobile1,
    },
    {
      key: 'risk',
      header: 'Risk',
      render: (row) => <RiskBadge riskLevel={row.risk_level} />,
    },
    {
      key: 'salesCount',
      header: 'Sales',
      render: (row) => row.salesCount,
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => (
        <span className={row.balance > 0 ? 'text-red-600' : 'text-green-600'}>{row.balance.toFixed(2)}</span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchKey="search"
      emptyMessage="No customers found."
    />
  )
}

