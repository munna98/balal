import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TRIAL_DAYS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const ownerName = typeof body.ownerName === 'string' ? body.ownerName.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const shopName = typeof body.shopName === 'string' ? body.shopName.trim() : ''
    const shopAddress = typeof body.shopAddress === 'string' ? body.shopAddress.trim() : ''
    const shopPhone = typeof body.shopPhone === 'string' ? body.shopPhone.trim() : ''

    if (!ownerName || !shopName) {
      return NextResponse.json(
        { data: null, error: 'Owner name and shop name are required' },
        { status: 400 }
      )
    }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)

    const tenant = await prisma.tenant.upsert({
      where: { supabase_user_id: user.id },
      update: {
        name: ownerName,
        phone: phone || null,
        trial_ends_at: trialEndsAt,
      },
      create: {
        supabase_user_id: user.id,
        name: ownerName,
        phone: phone || null,
        trial_ends_at: trialEndsAt,
      },
    })

    const shop = await prisma.shop.create({
      data: {
        tenant_id: tenant.id,
        name: shopName,
        address: shopAddress || null,
        phone: shopPhone || null,
        is_active: true,
      },
    })

    // Fire-and-forget alert webhook for admin notifications.
    fetch(new URL('/api/webhooks/new-tenant', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      body: JSON.stringify({
        tenantName: tenant.name,
        ownerEmail: user.email || '',
        shopName: shop.name,
        phone: tenant.phone || undefined,
        signupTime: tenant.created_at.toISOString(),
      }),
    }).catch(() => undefined)

    return NextResponse.json({ data: { tenant, shop }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to create tenant' }, { status: 500 })
  }
}
