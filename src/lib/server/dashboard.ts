import { cookies } from 'next/headers'
import { cacheTag, cacheLife } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { Shop, Tenant } from '@/types'

const ACTIVE_SHOP_COOKIE = 'balal_active_shop'

function resolveActiveShop(shops: Shop[], cookieActiveShopId?: string) {
  if (!shops.length) return null
  if (!cookieActiveShopId) return shops[0] ?? null

  return shops.find((shop) => shop.id === cookieActiveShopId) ?? shops[0] ?? null
}

async function getTenantByUserId(userId: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('tenant', `tenant-user-${userId}`)

  return prisma.tenant.findUnique({ where: { supabase_user_id: userId } })
}

async function getShopsByTenantId(tenantId: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('shops', `shops-tenant-${tenantId}`)

  return prisma.shop.findMany({
    where: { tenant_id: tenantId, is_active: true },
    orderBy: { created_at: 'desc' },
  })
}

export async function getTenantShopsAndActiveShop(): Promise<{
  tenant: Tenant | null
  shops: Shop[]
  activeShop: Shop | null
}> {
  // Auth must run outside cache — cookies/headers are request-time APIs
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { tenant: null, shops: [], activeShop: null }

  const tenant = await getTenantByUserId(user.id)

  if (!tenant) return { tenant: null, shops: [], activeShop: null }

  const shops = await getShopsByTenantId(tenant.id)

  // Cookie lookup must also be outside cache
  const cookieStore = await cookies()
  const cookieActiveShopId = cookieStore.get(ACTIVE_SHOP_COOKIE)?.value
  const activeShop = resolveActiveShop(shops as Shop[], cookieActiveShopId)

  return { tenant: tenant as Tenant, shops: shops as Shop[], activeShop }
}
