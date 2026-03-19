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
    const customer = await prisma.customer.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        sales: {
          include: { advances: true },
          orderBy: { created_at: 'desc' },
        },
      },
    })

    if (!customer) return NextResponse.json({ data: null, error: 'Customer not found' }, { status: 404 })

    const sales = customer.sales.map((sale) => {
      const totalPaid = sale.advances.reduce((sum, a) => sum + toNumber(a.amount_paid), 0)
      const totalRepaid = sale.advances.reduce((sum, a) => sum + (a.amount_repaid ? toNumber(a.amount_repaid) : 0), 0)
      const balance = totalPaid - totalRepaid
      return { ...sale, total_paid: totalPaid, total_repaid: totalRepaid, balance }
    })

    const totalOutstandingBalance = sales.reduce((sum, sale) => sum + sale.balance, 0)
    const { sales: _sales, ...customerData } = customer

    return NextResponse.json({
      data: {
        customer: customerData,
        sales,
        total_outstanding_balance: totalOutstandingBalance,
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.customer.findFirst({
      where: { id, tenant_id: tenantId },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ data: null, error: 'Customer not found' }, { status: 404 })

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: typeof body.name === 'string' ? body.name.trim() : undefined,
        aadhaar: typeof body.aadhaar === 'string' ? body.aadhaar || null : undefined,
        photo_url: typeof body.photo_url === 'string' ? body.photo_url || null : undefined,
        mobile1: typeof body.mobile1 === 'string' ? body.mobile1.trim() : undefined,
        mobile2: typeof body.mobile2 === 'string' ? body.mobile2 || null : undefined,
        mobile2_label: typeof body.mobile2_label === 'string' ? body.mobile2_label || null : undefined,
        mobile3: typeof body.mobile3 === 'string' ? body.mobile3 || null : undefined,
        mobile3_label: typeof body.mobile3_label === 'string' ? body.mobile3_label || null : undefined,
        mobile4: typeof body.mobile4 === 'string' ? body.mobile4 || null : undefined,
        mobile4_label: typeof body.mobile4_label === 'string' ? body.mobile4_label || null : undefined,
        risk_level: typeof body.risk_level === 'string' ? body.risk_level : undefined,
        risk_score: typeof body.risk_score === 'number' ? body.risk_score : undefined,
      },
    })

    return NextResponse.json({ data: updated, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to update customer' }, { status: 500 })
  }
}
