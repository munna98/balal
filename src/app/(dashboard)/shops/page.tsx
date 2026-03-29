import { format } from 'date-fns'
import Link from 'next/link'
import { MapPin, Phone, ShoppingBag, Store, TrendingUp, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

export default async function ShopsPage() {
  const { tenant, activeShop } = await getTenantShopsAndActiveShop()

  if (!tenant) {
    return <main className="space-y-4">Unauthorized</main>
  }

  const shops = await prisma.shop.findMany({
    where: { tenant_id: tenant.id },
    orderBy: { created_at: 'desc' },
    include: {
      _count: { select: { sales: true } },
    },
  })

  const shopIds = shops.map((s) => s.id)
  const advances =
    shopIds.length > 0
      ? await prisma.advance.findMany({
          where: { shop_id: { in: shopIds } },
          select: { shop_id: true, amount_paid: true, amount_repaid: true },
        })
      : []

  const advanceBalanceByShop = new Map<string, number>()
  for (const a of advances) {
    const paid = toNumber(a.amount_paid)
    const repaid = a.amount_repaid ? toNumber(a.amount_repaid) : 0
    const delta = paid - repaid
    advanceBalanceByShop.set(a.shop_id, (advanceBalanceByShop.get(a.shop_id) ?? 0) + delta)
  }

  const totalSales = shops.reduce((sum, s) => sum + s._count.sales, 0)
  const totalOutstanding = shops.reduce((sum, s) => sum + (advanceBalanceByShop.get(s.id) ?? 0), 0)
  const atShopLimit = shops.length >= tenant.shop_limit
  const slotsLeft = Math.max(0, tenant.shop_limit - shops.length)

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Shops</h2>
          <p className="text-sm text-muted-foreground">
            Manage locations, switch workspace, and see sales at a glance.
          </p>
        </div>
        {atShopLimit ? (
          <Button type="button" disabled>
            Add shop
          </Button>
        ) : (
          <Button asChild>
            <Link href="/shops/new">Add shop</Link>
          </Button>
        )}
      </div>

      {atShopLimit ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          You are using all {tenant.shop_limit} shop slot{tenant.shop_limit === 1 ? '' : 's'} on your plan. Contact support to add more.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {slotsLeft} shop slot{slotsLeft === 1 ? '' : 's'} remaining on your plan.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">Locations</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline gap-2 pt-0">
            <span className="text-2xl font-semibold">{shops.length}</span>
            <span className="text-xs text-muted-foreground">of {tenant.shop_limit}</span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">Total sales (all shops)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-2xl font-semibold">{totalSales}</span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-normal text-muted-foreground">Outstanding advances</CardTitle>
          </CardHeader>
          <CardContent className={`pt-0 text-2xl font-semibold ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalOutstanding.toFixed(2)}
          </CardContent>
        </Card>
      </div>

      {shops.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Store className="size-7 text-muted-foreground" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="font-medium">No shops yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first shop to record sales, customers, and advances for that location.
              </p>
            </div>
            <Button asChild>
              <Link href="/shops/new">Create shop</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {shops.map((shop) => {
            const outstanding = advanceBalanceByShop.get(shop.id) ?? 0
            const isCurrent = activeShop?.id === shop.id

            return (
              <li key={shop.id}>
                <Link
                  href={`/shops/${shop.id}`}
                  className={`group flex flex-col rounded-lg bg-card p-4 text-card-foreground ring-1 transition-colors hover:bg-muted/40 ${
                    isCurrent ? 'ring-primary ring-2' : 'ring-foreground/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-sm font-medium">{shop.name}</h3>
                        {isCurrent ? (
                          <Badge variant="default" className="text-[0.625rem]">
                            Active
                          </Badge>
                        ) : null}
                        {!shop.is_active ? (
                          <Badge variant="outline" className="text-[0.625rem]">
                            Inactive
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added {format(new Date(shop.created_at), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {(shop.address || shop.phone) && (
                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      {shop.address ? (
                        <p className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-3.5 shrink-0" />
                          <span className="line-clamp-2">{shop.address}</span>
                        </p>
                      ) : null}
                      {shop.phone ? (
                        <p className="flex items-center gap-2">
                          <Phone className="size-3.5 shrink-0" />
                          <span>{shop.phone}</span>
                        </p>
                      ) : null}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-foreground/10 pt-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">Sales</p>
                        <p className="text-sm font-semibold">{shop._count.sales}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">Advance bal.</p>
                        <p className={`text-sm font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {outstanding.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
