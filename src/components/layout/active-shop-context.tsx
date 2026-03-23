'use client'

import { createContext, useContext } from 'react'
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
  return <DashboardContext.Provider value={{ tenant, activeShop }}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  return useContext(DashboardContext)
}

export function useActiveShop() {
  return useDashboard().activeShop
}

export function useTenantFromDashboard() {
  return useDashboard().tenant
}

