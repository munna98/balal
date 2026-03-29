import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, ShoppingBag, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { BackButton } from '@/components/shared/BackButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UseActiveShopButton } from '@/components/shops/UseActiveShopButton'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

export default async function ShopDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { tenant, activeShop } = await getTenantShopsAndActiveShop()

  if (!tenant) {
    return <main className="space-y-4">Unauthorized</main>
  }

  const shop = await prisma.shop.findFirst({
    where: { id: params.id, tenant_id: tenant.id },
    include: {
      _count: { select: { sales: true } },
    },
  })

  if (!shop) {
    notFound()
  }

  const advances = await prisma.advance.findMany({
    where: { shop_id: shop.id },
    select: { amount_paid: true, amount_repaid: true },
  })

  const outstanding = advances.reduce((sum, a) => {
    const paid = toNumber(a.amount_paid)
    const repaid = a.amount_repaid ? toNumber(a.amount_repaid) : 0
    return sum + (paid - repaid)
  }, 0)

  const isCurrentWorkspace = activeShop?.id === shop.id

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2">
          <BackButton href="/shops" compact label="Back to shops" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{shop.name}</h2>
              {isCurrentWorkspace ? <Badge>Active workspace</Badge> : null}
              {!shop.is_active ? (
                <Badge variant="outline">Inactive</Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">Added {format(new Date(shop.created_at), 'dd MMM yyyy')}</p>
          </div>
        </div>
        <UseActiveShopButton shopId={shop.id} isCurrentWorkspace={isCurrentWorkspace} />
      </div>

      {(shop.address || shop.phone) && (
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {shop.address ? (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{shop.address}</span>
              </p>
            ) : null}
            {shop.phone ? (
              <p className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <span>{shop.phone}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShoppingBag className="size-4" />
              Sales recorded
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{shop._count.sales}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4" />
              Outstanding advances
            </CardTitle>
          </CardHeader>
          <CardContent className={`text-2xl font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {outstanding.toFixed(2)}
          </CardContent>
        </Card>
      </div>

      <Card size="sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Where to manage data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Sales and advances in the app use the <span className="font-medium text-foreground">active shop</span> from the sidebar.
            {isCurrentWorkspace ? ' This shop is active.' : ' Switch with the button above or the shop menu.'}
          </p>
          <Button asChild variant="outline" size="sm" className="shrink-0 self-start sm:self-auto">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
