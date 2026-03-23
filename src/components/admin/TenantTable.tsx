'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'

type TenantRow = {
  id: string
  name: string
  email: string
  phone: string | null
  subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED'
  trial_ends_at: Date | null
  subscribed_at: Date | null
  created_at: Date
  shop_count: number
}

type FilterValue = 'ALL' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED'

export function TenantTable({ tenants }: { tenants: TenantRow[] }) {
  const [filter, setFilter] = useState<FilterValue>('ALL')
  const router = useRouter()

  const filteredTenants = useMemo(() => {
    if (filter === 'ALL') return tenants
    return tenants.filter((tenant) => tenant.subscription_status === filter)
  }, [filter, tenants])

  async function toggleStatus(tenant: TenantRow) {
    const next = tenant.subscription_status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_status: next }),
    })
    router.refresh()
  }

  const columns: DataTableColumn<TenantRow>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (tenant) => (
        <Link href={`/admin/tenants/${tenant.id}`} className="font-medium underline-offset-4 hover:underline">
          {tenant.name}
        </Link>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (tenant) => tenant.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (tenant) =>
        tenant.phone ? (
          <a
            href={`https://wa.me/91${tenant.phone}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {tenant.phone}
          </a>
        ) : (
          '-'
        ),
    },
    {
      key: 'shop_count',
      header: 'Shop count',
      render: (tenant) => tenant.shop_count,
    },
    {
      key: 'subscription_status',
      header: 'Status',
      render: (tenant) => (
        <Badge className={SUBSCRIPTION_STATUS_LABELS[tenant.subscription_status].color}>
          {SUBSCRIPTION_STATUS_LABELS[tenant.subscription_status].label}
        </Badge>
      ),
    },
    {
      key: 'subscription_date',
      header: 'Trial ends / Subscribed',
      render: (tenant) =>
        tenant.subscription_status === 'ACTIVE'
          ? tenant.subscribed_at
            ? format(tenant.subscribed_at, 'dd MMM yyyy')
            : '-'
          : tenant.trial_ends_at
            ? format(tenant.trial_ends_at, 'dd MMM yyyy')
            : '-',
    },
    {
      key: 'created_at',
      header: 'Signed up',
      render: (tenant) => format(tenant.created_at, 'dd MMM yyyy'),
    },
    {
      key: 'actions',
      header: '',
      render: (tenant) => (
        <div className="flex flex-wrap justify-end gap-2 md:flex-nowrap">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/tenants/${tenant.id}`}>View</Link>
          </Button>
          <Button
            size="sm"
            variant={tenant.subscription_status === 'SUSPENDED' ? 'default' : 'destructive'}
            onClick={() => toggleStatus(tenant)}
          >
            {tenant.subscription_status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterValue)}>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="TRIAL">Trial</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="SUSPENDED">Suspended</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable columns={columns} data={filteredTenants} emptyMessage="No tenants found." />
    </div>
  )
}
