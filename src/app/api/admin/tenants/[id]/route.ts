import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { TRIAL_DAYS } from '@/lib/constants'
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

    const existing = await prisma.tenant.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
    }

    const hasStatusInput = 'subscription_status' in body
    if (
      hasStatusInput &&
      body.subscription_status !== 'TRIAL' &&
      body.subscription_status !== 'ACTIVE' &&
      body.subscription_status !== 'SUSPENDED'
    ) {
      return NextResponse.json(
        { data: null, error: 'Invalid subscription status' },
        { status: 400 }
      )
    }

    const subscriptionStatus = hasStatusInput ? body.subscription_status : undefined

    const hasPlanInput = 'plan' in body
    if (hasPlanInput && body.plan !== 'BASIC' && body.plan !== 'PREMIUM') {
      return NextResponse.json({ data: null, error: 'Invalid plan' }, { status: 400 })
    }

    const plan = hasPlanInput ? body.plan : undefined

    let shopLimit: number | undefined
    const hasShopLimitInput = body.shop_limit !== undefined && body.shop_limit !== null
    if (hasShopLimitInput) {
      const n = typeof body.shop_limit === 'number' ? body.shop_limit : Number(body.shop_limit)
      if (Number.isFinite(n) && n >= 1) {
        shopLimit = Math.floor(n)
      } else {
        return NextResponse.json(
          { data: null, error: 'Shop limit must be at least 1' },
          { status: 400 }
        )
      }
    }

    let subscribedAt: Date | null | undefined
    let trialEndsAt: Date | null | undefined
    if (subscriptionStatus === 'ACTIVE') {
      subscribedAt = existing.subscribed_at ?? new Date()
      trialEndsAt = null
    } else if (subscriptionStatus === 'TRIAL') {
      subscribedAt = null
      trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    } else {
      subscribedAt = undefined
      trialEndsAt = undefined
    }

    const hasAdminNotesInput = typeof body.admin_notes === 'string'
    if (
      !hasStatusInput &&
      !hasPlanInput &&
      !hasShopLimitInput &&
      !hasAdminNotesInput
    ) {
      return NextResponse.json({ data: null, error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        subscription_status: subscriptionStatus,
        admin_notes: hasAdminNotesInput ? body.admin_notes : undefined,
        shop_limit: shopLimit,
        plan,
        subscribed_at: subscribedAt,
        trial_ends_at: trialEndsAt,
      },
    })

    revalidatePath('/admin')
    revalidatePath(`/admin/tenants/${id}`)

    return NextResponse.json({ data: updated, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to update tenant' }, { status: 500 })
  }
}
