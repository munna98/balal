'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'

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

      <DataTable
        headers={[
          'Name',
          'Email',
          'Phone',
          'Shop count',
          'Status',
          'Trial ends / Subscribed',
          'Signed up',
          'Actions',
        ]}
      >
        {filteredTenants.map((tenant) => (
          <tr key={tenant.id} className="border-t">
            <td className="px-3 py-2 font-medium">{tenant.name}</td>
            <td className="px-3 py-2">{tenant.email}</td>
            <td className="px-3 py-2">
              {tenant.phone ? (
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
              )}
            </td>
            <td className="px-3 py-2">{tenant.shop_count}</td>
            <td className="px-3 py-2">
              <Badge className={SUBSCRIPTION_STATUS_LABELS[tenant.subscription_status].color}>
                {SUBSCRIPTION_STATUS_LABELS[tenant.subscription_status].label}
              </Badge>
            </td>
            <td className="px-3 py-2 text-muted-foreground">
              {tenant.subscription_status === 'ACTIVE'
                ? tenant.subscribed_at
                  ? format(tenant.subscribed_at, 'dd MMM yyyy')
                  : '-'
                : tenant.trial_ends_at
                  ? format(tenant.trial_ends_at, 'dd MMM yyyy')
                  : '-'}
            </td>
            <td className="px-3 py-2 text-muted-foreground">{format(tenant.created_at, 'dd MMM yyyy')}</td>
            <td className="px-3 py-2">
              <div className="flex gap-2">
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
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  )
}
