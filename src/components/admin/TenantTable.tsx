'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'

type TenantRow = {
  id: string
  name: string
  supabase_user_id: string
  email: string | null
  phone: string | null
  subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED'
  trial_ends_at: Date | null
  subscribed_at: Date | null
  created_at: Date
  shop_count: number
  customer_count: number
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
    const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_status: next }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error((json as { error?: string }).error || 'Failed to update status')
      return
    }
    toast.success(next === 'SUSPENDED' ? 'Tenant suspended' : 'Tenant activated')
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
      render: (tenant) => (
        <span className="max-w-[220px] truncate font-mono text-xs" title={tenant.supabase_user_id}>
          {tenant.email ?? '—'}
        </span>
      ),
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
      header: 'Shops',
      render: (tenant) => tenant.shop_count,
    },
    {
      key: 'customer_count',
      header: 'Customers',
      render: (tenant) => tenant.customer_count,
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
