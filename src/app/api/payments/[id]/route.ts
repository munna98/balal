import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function getTenantId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const tenant = await prisma.tenant.findUnique({
    where: { supabase_user_id: user.id },
    select: { id: true },
  })
  return tenant?.id ?? null
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await prisma.payment.findFirst({
      where: { id, shop: { tenant_id: tenantId } },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ data: null, error: 'Payment not found' }, { status: 404 })

    const body = await request.json()
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        paid_date: body.paid_date ? new Date(body.paid_date) : undefined,
        amount_paid: body.amount_paid,
        repaid_date: body.repaid_date ? new Date(body.repaid_date) : undefined,
        amount_repaid: body.amount_repaid,
        note: typeof body.note === 'string' ? body.note || null : undefined,
      },
    })

    return NextResponse.json({ data: updated, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to update payment' }, { status: 500 })
  }
}
