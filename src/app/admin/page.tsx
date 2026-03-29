import { startOfMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { TenantTable } from '@/components/admin/TenantTable'
import { getOwnerEmailsBySupabaseIds } from '@/lib/server/tenant-owner-emails'
import { connection } from 'next/server'


export default async function AdminPage() {
  await connection() // new Date() used below — opt out of prerender
  type TenantAdminRow = {
    id: string
    name: string
    supabase_user_id: string
    phone: string | null
    subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED'
    trial_ends_at: Date | null
    subscribed_at: Date | null
    created_at: Date
    _count: { shops: number; customers: number }
  }

  const tenants = (await prisma.tenant.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          shops: true,
          customers: true,
        },
      },
    },
  })) as unknown as TenantAdminRow[]

  const emailByUserId = await getOwnerEmailsBySupabaseIds(tenants.map((t) => t.supabase_user_id))

  const thisMonthStart = startOfMonth(new Date())

  const summary = {
    total: tenants.length,
    active: tenants.filter((tenant) => tenant.subscription_status === 'ACTIVE').length,
    trial: tenants.filter((tenant) => tenant.subscription_status === 'TRIAL').length,
    suspended: tenants.filter((tenant) => tenant.subscription_status === 'SUSPENDED').length,
    signupsThisMonth: tenants.filter((tenant) => tenant.created_at >= thisMonthStart).length,
  }

  const rows = tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    supabase_user_id: tenant.supabase_user_id,
    email: emailByUserId.get(tenant.supabase_user_id) ?? null,
    phone: tenant.phone,
    subscription_status: tenant.subscription_status,
    trial_ends_at: tenant.trial_ends_at,
    subscribed_at: tenant.subscribed_at,
    created_at: tenant.created_at,
    shop_count: tenant._count.shops,
    customer_count: tenant._count.customers,
  }))

  return (
    <main className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Balal Finance — Admin</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total tenants</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.active}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Trial</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.trial}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Suspended</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.suspended}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Signups this month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.signupsThisMonth}</CardContent>
        </Card>
      </div>

      <TenantTable tenants={rows} />
    </main>
  )
}
