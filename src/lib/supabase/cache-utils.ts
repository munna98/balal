/**
 * Utility functions for managing tenant subscription cache
 * Used by middleware and auth handlers to invalidate cache
 */

export const TENANT_CACHE_COOKIE = 'balal_tenant_cache'

/**
 * Delete tenant cache cookie
 * Call this on logout or when subscription status changes
 */
export function deleteTenantCacheHeader() {
  return {
    name: TENANT_CACHE_COOKIE,
    value: '',
    maxAge: 0,
  }
}

/**
 * Parse tenant cache from cookie value
 */
export function parseTenantCache(cookieValue?: string) {
  if (!cookieValue) return null
  try {
    return JSON.parse(decodeURIComponent(cookieValue))
  } catch {
    return null
  }
}
