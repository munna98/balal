import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

function toNumber(value: { toNumber: () => number } | number) {
  return typeof value === 'number' ? value : value.toNumber()
}

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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const sale = await prisma.sale.findFirst({
      where: {
        id,
        shop: { tenant_id: tenantId },
      },
      include: {
        customer: true,
        second_party_customer: true,
        payments: true,
      },
    })
    if (!sale) return NextResponse.json({ data: null, error: 'Sale not found' }, { status: 404 })

    type PaymentForSaleApi = {
      amount_paid: { toNumber: () => number } | number
      amount_repaid: ({ toNumber: () => number } | number) | null
    }

    const payments = sale.payments as unknown as PaymentForSaleApi[]

    const totalPaid = payments.reduce((sum, a) => sum + toNumber(a.amount_paid), 0)
    const totalRepaid = payments.reduce((sum, a) => sum + (a.amount_repaid ? toNumber(a.amount_repaid) : 0), 0)
    const balance = totalPaid - totalRepaid

    return NextResponse.json({
      data: {
        ...sale,
        total_paid: totalPaid,
        total_repaid: totalRepaid,
        balance,
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch sale' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.sale.findFirst({
      where: { id, shop: { tenant_id: tenantId } },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ data: null, error: 'Sale not found' }, { status: 404 })

    if (body.second_party_customer_id) {
      const secondParty = await prisma.customer.findFirst({
        where: { id: body.second_party_customer_id, tenant_id: tenantId },
        select: { id: true },
      })
      if (!secondParty) {
        return NextResponse.json(
          { data: null, error: 'Second party customer must belong to your tenant' },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        loan_issue_date: body.loan_issue_date ? new Date(body.loan_issue_date) : undefined,
        down_payment: body.down_payment,
        loan_amount: body.loan_amount,
        tenure_months: body.tenure_months,
        emi_amount: body.emi_amount,
        device_name: body.device_name,
        imei: typeof body.imei === 'string' ? body.imei || null : undefined,
        reference_number: typeof body.reference_number === 'string' ? body.reference_number || null : undefined,
        co_name: typeof body.co_name === 'string' ? body.co_name || null : undefined,
        co_mobile: typeof body.co_mobile === 'string' ? body.co_mobile || null : undefined,
        is_second_party: typeof body.is_second_party === 'boolean' ? body.is_second_party : undefined,
        second_party_customer_id:
          typeof body.second_party_customer_id === 'string' ? body.second_party_customer_id || null : undefined,
        notes: typeof body.notes === 'string' ? body.notes || null : undefined,
      },
    })

    return NextResponse.json({ data: updated, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to update sale' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await prisma.sale.findFirst({
      where: { id, shop: { tenant_id: tenantId } },
    })

    if (!existing) return NextResponse.json({ data: null, error: 'Sale not found' }, { status: 404 })

    await prisma.sale.delete({ where: { id } })
    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to delete sale' }, { status: 500 })
  }
}
