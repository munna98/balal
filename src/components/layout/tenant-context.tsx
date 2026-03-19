'use client'

import { createContext, useContext } from 'react'
import type { Tenant } from '@/types'

type TenantContextValue = {
  tenant: Tenant | null
}

const TenantContext = createContext<TenantContextValue>({ tenant: null })

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant | null
  children: React.ReactNode
}) {
  return <TenantContext.Provider value={{ tenant }}>{children}</TenantContext.Provider>
}

export function useTenant() {
  return useContext(TenantContext)
}
