import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const TENANT_CACHE_COOKIE = 'balal_tenant_cache'
const TENANT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

function parseTenantCache(cookieValue?: string) {
  if (!cookieValue) return null
  try {
    return JSON.parse(decodeURIComponent(cookieValue))
  } catch {
    return null
  }
}

function setTenantCache(subscription_status: string, trial_ends_at: string | null) {
  const cacheData = {
    subscription_status,
    trial_ends_at,
    timestamp: Date.now(),
  }
  return encodeURIComponent(JSON.stringify(cacheData))
}

function isCacheValid(cache: any): boolean {
  if (!cache || !cache.timestamp) return false
  return Date.now() - cache.timestamp < TENANT_CACHE_TTL
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isApiRoute = pathname.startsWith('/api')
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')
  const isBillingRoute = request.nextUrl.pathname.startsWith('/billing')
  const isPublic = request.nextUrl.pathname === '/'

  if (!user && !isAuthRoute && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Protect admin routes — only ADMIN_EMAIL can access
  if (isAdminRoute && user?.email !== process.env.ADMIN_EMAIL) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Redirect admin to /admin if they are on dashboard, onboarding or home
  if (
    user?.email === process.env.ADMIN_EMAIL &&
    !isAdminRoute &&
    !isAuthRoute &&
    !isBillingRoute &&
    !isApiRoute
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // Check subscription status for signed-in users (OPTIMIZED with caching)
  if (user && !isAuthRoute && !isAdminRoute && !isOnboarding && !isBillingRoute) {
    // Try to use cached tenant data first
    const cachedTenant = parseTenantCache(request.cookies.get(TENANT_CACHE_COOKIE)?.value)

    let tenant = null

    if (cachedTenant && isCacheValid(cachedTenant)) {
      // Cache is still fresh, use it (skips expensive DB query!)
      tenant = cachedTenant
    } else {
      // Cache is expired or missing, fetch fresh data
      const { data } = await supabase
        .from('Tenant')
        .select('subscription_status, trial_ends_at')
        .eq('supabase_user_id', user.id)
        .maybeSingle()

      if (data) {
        tenant = data
        // Update the cache in the response
        supabaseResponse.cookies.set(
          TENANT_CACHE_COOKIE,
          setTenantCache(data.subscription_status, data.trial_ends_at),
          {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: TENANT_CACHE_TTL / 1000,
          }
        )
      }
    }

    if (tenant) {
      const isTrialExpired =
        tenant.subscription_status === 'TRIAL' &&
        !!tenant.trial_ends_at &&
        new Date(tenant.trial_ends_at).getTime() < Date.now()
      const isSuspended = tenant.subscription_status === 'SUSPENDED'

      if (isTrialExpired || isSuspended) {
        const url = request.nextUrl.clone()
        url.pathname = '/billing'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
