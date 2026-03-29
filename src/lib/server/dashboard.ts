import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { Shop, Tenant } from '@/types'

const ACTIVE_SHOP_COOKIE = 'balal_active_shop'

function resolveActiveShop(shops: Shop[], cookieActiveShopId?: string) {
  if (!shops.length) return null
  if (!cookieActiveShopId) return shops[0] ?? null

  return shops.find((shop) => shop.id === cookieActiveShopId) ?? shops[0] ?? null
}

export async function getTenantShopsAndActiveShop(): Promise<{
  tenant: Tenant | null
  shops: Shop[]
  activeShop: Shop | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { tenant: null, shops: [], activeShop: null }

  const tenant = await prisma.tenant.findUnique({
    where: { supabase_user_id: user.id },
  })

  if (!tenant) return { tenant: null, shops: [], activeShop: null }

  const shops = await prisma.shop.findMany({
    where: { tenant_id: tenant.id, is_active: true },
    orderBy: { created_at: 'desc' },
  })

  const cookieStore = await cookies()
  const cookieActiveShopId = cookieStore.get(ACTIVE_SHOP_COOKIE)?.value
  const activeShop = resolveActiveShop(shops, cookieActiveShopId)

  return { tenant, shops, activeShop }
}

