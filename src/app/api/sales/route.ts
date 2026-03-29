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

export async function GET(request: Request) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shop_id')
    const outstandingOnly = searchParams.get('outstanding_payment') === 'true'

    if (!shopId) {
      return NextResponse.json({ data: null, error: 'shop_id is required' }, { status: 400 })
    }

    const shop = await prisma.shop.findFirst({
      where: { id: shopId, tenant_id: tenantId },
      select: { id: true },
    })
    if (!shop) return NextResponse.json({ data: null, error: 'Shop not found' }, { status: 404 })

    type SaleApiList = {
      payments: Array<{
        amount_paid: { toNumber: () => number } | number
        amount_repaid: ({ toNumber: () => number } | number) | null
      }>
      customer: { name: string }
      payment_balance?: number
    } & Record<string, unknown>

    const sales = (await prisma.sale.findMany({
      where: { shop_id: shopId },
      include: {
        customer: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { created_at: 'desc' },
    })) as unknown as SaleApiList[]

    const mapped = sales
      .map((sale) => {
        const totalPaid = sale.payments.reduce((sum, a) => sum + toNumber(a.amount_paid), 0)
        const totalRepaid = sale.payments.reduce((sum, a) => sum + (a.amount_repaid ? toNumber(a.amount_repaid) : 0), 0)
        const paymentBalance = totalPaid - totalRepaid
        return {
          ...sale,
          customer_name: sale.customer.name,
          payment_balance: paymentBalance,
        }
      })
      .filter((sale) => (outstandingOnly ? sale.payment_balance > 0 : true))

    return NextResponse.json({ data: mapped, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()

    const shop = await prisma.shop.findFirst({
      where: { id: body.shop_id, tenant_id: tenantId },
      select: { id: true },
    })
    if (!shop) return NextResponse.json({ data: null, error: 'Invalid shop' }, { status: 400 })

    const customer = await prisma.customer.findFirst({
      where: { id: body.customer_id, tenant_id: tenantId },
      select: { id: true },
    })
    if (!customer) return NextResponse.json({ data: null, error: 'Invalid customer' }, { status: 400 })

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

    const sale = await prisma.sale.create({
      data: {
        shop_id: body.shop_id,
        customer_id: body.customer_id,
        loan_issue_date: new Date(body.loan_issue_date),
        down_payment: body.down_payment,
        loan_amount: body.loan_amount,
        tenure_months: body.tenure_months,
        emi_amount: body.emi_amount,
        device_name: body.device_name,
        imei: body.imei || null,
        reference_number: body.reference_number || null,
        co_name: body.co_name || null,
        co_mobile: body.co_mobile || null,
        is_second_party: Boolean(body.is_second_party),
        second_party_customer_id: body.second_party_customer_id || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ data: sale, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to create sale' }, { status: 500 })
  }
}
