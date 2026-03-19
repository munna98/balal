import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
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

  // Check subscription status for signed-in users.
  if (user && !isAuthRoute && !isAdminRoute && !isOnboarding && !isBillingRoute) {
    const { data: tenant } = await supabase
      .from('Tenant')
      .select('subscription_status, trial_ends_at')
      .eq('supabase_user_id', user.id)
      .maybeSingle()

    const isTrialExpired =
      tenant?.subscription_status === 'TRIAL' &&
      !!tenant?.trial_ends_at &&
      new Date(tenant.trial_ends_at).getTime() < Date.now()
    const isSuspended = tenant?.subscription_status === 'SUSPENDED'

    if (isTrialExpired || isSuspended) {
      const url = request.nextUrl.clone()
      url.pathname = '/billing'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
