import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { TenantStatusEditor } from '@/components/admin/TenantStatusEditor'
import { AdminNotesEditor } from '@/components/admin/AdminNotesEditor'

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  type TenantAdminShop = {
    id: string
    name: string
    is_active: boolean
    _count: { sales: number }
  }

  type TenantAdminDetail = {
    id: string
    name: string
    supabase_user_id: string
    phone: string | null
    subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED'
    trial_ends_at: Date | null
    subscribed_at: Date | null
    created_at: Date
    admin_notes: string | null
    shops: TenantAdminShop[]
    _count: { customers: number }
  }

  const tenant = (await prisma.tenant.findUnique({
    where: { id },
    include: {
      shops: {
        include: {
          _count: {
            select: { sales: true },
          },
        },
        orderBy: { created_at: 'desc' },
      },
      _count: {
        select: {
          customers: true,
        },
      },
    },
  })) as unknown as TenantAdminDetail

  if (!tenant) notFound()

  const salesCount = await prisma.sale.count({
    where: {
      shop: { tenant_id: tenant.id },
    },
  })

  type AdvanceForAdminTenant = {
    amount_paid: unknown
    amount_repaid: unknown | null
  }

  const advances = (await prisma.advance.findMany({
    where: {
      shop: { tenant_id: tenant.id },
    },
    select: {
      amount_paid: true,
      amount_repaid: true,
    },
  })) as unknown as AdvanceForAdminTenant[]

  const totalOutstanding = advances.reduce((sum, advance) => {
    const paid = Number(advance.amount_paid)
    const repaid = advance.amount_repaid ? Number(advance.amount_repaid) : 0
    return sum + (paid - repaid)
  }, 0)

  async function toggleShopActive(formData: FormData) {
    'use server'

    const shopId = String(formData.get('shopId') || '')
    const nextValue = String(formData.get('nextValue') || '') === 'true'

    await prisma.shop.update({
      where: { id: shopId },
      data: { is_active: nextValue },
    })

    revalidatePath(`/admin/tenants/${id}`)
  }

  const statusMeta =
    SUBSCRIPTION_STATUS_LABELS[tenant.subscription_status as keyof typeof SUBSCRIPTION_STATUS_LABELS]

  return (
    <main className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Tenant detail</h1>

      <Card>
        <CardHeader>
          <CardTitle>Owner info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p><span className="font-medium">Name:</span> {tenant.name}</p>
          <p><span className="font-medium">Email:</span> {tenant.supabase_user_id}</p>
          <p><span className="font-medium">Phone:</span> {tenant.phone || '-'}</p>
          <p><span className="font-medium">Signup date:</span> {format(tenant.created_at, 'dd MMM yyyy, hh:mm a')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current status:</span>
            <Badge className={statusMeta.color}>{statusMeta.label}</Badge>
          </div>
          <p className="text-sm">
            <span className="font-medium">trial_ends_at:</span>{' '}
            {tenant.trial_ends_at ? format(tenant.trial_ends_at, 'dd MMM yyyy') : '-'}
          </p>
          <p className="text-sm">
            <span className="font-medium">subscribed_at:</span>{' '}
            {tenant.subscribed_at ? format(tenant.subscribed_at, 'dd MMM yyyy') : '-'}
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Admin notes</p>
            <AdminNotesEditor tenantId={tenant.id} initialValue={tenant.admin_notes || ''} />
          </div>
          <TenantStatusEditor tenantId={tenant.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick stats</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-3">
          <p><span className="font-medium">Total customers:</span> {tenant._count.customers}</p>
          <p><span className="font-medium">Total sales:</span> {salesCount}</p>
          <p><span className="font-medium">Total advances outstanding:</span> {totalOutstanding.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shops</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tenant.shops.map((shop) => (
            <div key={shop.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <div className="text-sm">
                <p className="font-medium">{shop.name}</p>
                <p className="text-muted-foreground">Sales: {shop._count.sales}</p>
              </div>
              <form action={toggleShopActive}>
                <input type="hidden" name="shopId" value={shop.id} />
                <input type="hidden" name="nextValue" value={shop.is_active ? 'false' : 'true'} />
                <Button type="submit" size="sm" variant={shop.is_active ? 'outline' : 'default'}>
                  {shop.is_active ? 'Set inactive' : 'Set active'}
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
