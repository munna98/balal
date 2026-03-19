import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewTenantAlert } from '@/lib/resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({
      where: { supabase_user_id: user.id },
      select: { id: true, name: true, phone: true, created_at: true },
    })
    if (!tenant) return NextResponse.json({ data: null, error: 'Tenant not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const shopNameFromBody = typeof body.shopName === 'string' ? body.shopName : ''
    let shopName = shopNameFromBody
    if (!shopName) {
      const firstShop = await prisma.shop.findFirst({
        where: { tenant_id: tenant.id },
        orderBy: { created_at: 'asc' },
        select: { name: true },
      })
      shopName = firstShop?.name || 'Unknown shop'
    }

    await sendNewTenantAlert({
      tenantName: tenant.name,
      ownerEmail: user.email || '',
      shopName,
      phone: tenant.phone || undefined,
      signupTime: tenant.created_at.toISOString(),
    })

    return NextResponse.json({ data: { sent: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to send tenant alert' }, { status: 500 })
  }
}
