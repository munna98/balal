import type { ReactNode } from 'react'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { TrialBanner } from '@/components/shared/TrialBanner'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { DashboardProvider } from '@/components/layout/active-shop-context'
import type { Tenant, Shop } from '@/types'
import { cookies } from 'next/headers'

function calculateTrialDaysLeft(trialEndsAt: Date | null) {
  if (!trialEndsAt) return 0
  const diffMs = trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let tenant: Tenant | null = null

  if (user) {
    tenant = await prisma.tenant.findUnique({
      where: { supabase_user_id: user.id },
    })
  }

  const shops: Shop[] = tenant
    ? await prisma.shop.findMany({
        where: { tenant_id: tenant.id, is_active: true },
        orderBy: { created_at: 'desc' },
      })
    : []

  const cookieStore = await cookies()
  const ACTIVE_SHOP_COOKIE = 'balal_active_shop'
  const cookieActiveShopId = cookieStore.get(ACTIVE_SHOP_COOKIE)?.value
  const activeShop = cookieActiveShopId ? shops.find((s) => s.id === cookieActiveShopId) || null : shops[0] || null

  // Ensure a stable active shop for cookie-driven server rendering.
  if (activeShop && (!cookieActiveShopId || activeShop.id !== cookieActiveShopId)) {
    cookieStore.set(ACTIVE_SHOP_COOKIE, activeShop.id, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  }

  const daysLeft = tenant ? calculateTrialDaysLeft(tenant.trial_ends_at) : 0
  const showTrialBanner = tenant?.subscription_status === 'TRIAL'

  return (
    <DashboardProvider tenant={tenant} activeShop={activeShop}>
      <div className="flex min-h-screen w-full">
        <Sidebar shops={shops} />
        <div className="flex min-h-screen flex-1 flex-col">
          <div className="px-4 pt-4">
            <TopBar />
          </div>

          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 pb-24 md:pb-10">
            {showTrialBanner ? <TrialBanner daysLeft={daysLeft} /> : null}
            {children}
          </div>
        </div>
      </div>
    </DashboardProvider>
  )
}
