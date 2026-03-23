'use client'

import { createContext, useContext, useEffect } from 'react'
import type { Shop, Tenant } from '@/types'

type DashboardContextValue = {
  tenant: Tenant | null
  activeShop: Shop | null
}

const DashboardContext = createContext<DashboardContextValue>({
  tenant: null,
  activeShop: null,
})

export function DashboardProvider({
  tenant,
  activeShop,
  children,
}: {
  tenant: Tenant | null
  activeShop: Shop | null
  children: React.ReactNode
}) {
  useEffect(() => {
    if (activeShop) {
      const ACTIVE_SHOP_COOKIE = 'balal_active_shop'
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${ACTIVE_SHOP_COOKIE}=`))
        ?.split('=')[1]

      if (cookieValue !== activeShop.id) {
        document.cookie = `${ACTIVE_SHOP_COOKIE}=${activeShop.id}; path=/; max-age=${
          60 * 60 * 24 * 30
        }; SameSite=Lax`
      }
    }
  }, [activeShop])

  return <DashboardContext.Provider value={{ tenant, activeShop }}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

export function useActiveShop() {
  return useDashboard().activeShop
}

export function useTenantFromDashboard() {
  return useDashboard().tenant
}


