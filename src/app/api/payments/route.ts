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

export async function GET(request: Request) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const saleId = searchParams.get('sale_id')
    if (!saleId) return NextResponse.json({ data: null, error: 'sale_id is required' }, { status: 400 })

    const sale = await prisma.sale.findFirst({
      where: { id: saleId, shop: { tenant_id: tenantId } },
      select: { id: true },
    })
    if (!sale) return NextResponse.json({ data: null, error: 'Sale not found' }, { status: 404 })

    const payments = await prisma.payment.findMany({
      where: { sale_id: saleId },
      orderBy: { paid_date: 'desc' },
    })
    return NextResponse.json({ data: payments, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()

    const sale = await prisma.sale.findFirst({
      where: { id: body.sale_id, shop: { tenant_id: tenantId } },
      select: { id: true, shop_id: true },
    })
    if (!sale) return NextResponse.json({ data: null, error: 'Invalid sale' }, { status: 400 })
    if (sale.shop_id !== body.shop_id) {
      return NextResponse.json({ data: null, error: 'shop_id does not match sale' }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: {
        sale_id: body.sale_id,
        shop_id: body.shop_id,
        paid_date: new Date(body.paid_date),
        amount_paid: body.amount_paid,
        repaid_date: body.repaid_date ? new Date(body.repaid_date) : null,
        amount_repaid: body.amount_repaid ?? null,
        note: body.note || null,
      },
    })
    return NextResponse.json({ data: payment, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to create payment' }, { status: 500 })
  }
}
