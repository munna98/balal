'use server'

import { cookies } from 'next/headers'
import { TENANT_CACHE_COOKIE } from './cache-utils'

/**
 * Clear the tenant subscription cache
 * Call this after subscription status changes or on logout
 */
export async function clearTenantCache() {
  const cookieStore = await cookies()
  cookieStore.delete(TENANT_CACHE_COOKIE)
}
