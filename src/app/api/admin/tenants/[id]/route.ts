import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const subscriptionStatus =
      body.subscription_status === 'TRIAL' ||
      body.subscription_status === 'ACTIVE' ||
      body.subscription_status === 'SUSPENDED'
        ? body.subscription_status
        : undefined

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        subscription_status: subscriptionStatus,
        admin_notes: typeof body.admin_notes === 'string' ? body.admin_notes : undefined,
        shop_limit: typeof body.shop_limit === 'number' ? body.shop_limit : undefined,
        subscribed_at:
          subscriptionStatus === 'ACTIVE'
            ? new Date()
            : subscriptionStatus === 'TRIAL'
              ? null
              : undefined,
      },
    })

    return NextResponse.json({ data: updated, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to update tenant' }, { status: 500 })
  }
}
