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
    select: { id: true, shop_limit: true },
  })
  return tenant
}

export async function GET() {
  try {
    const tenant = await getTenantId()
    if (!tenant) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const shops = await prisma.shop.findMany({
      where: { tenant_id: tenant.id },
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { sales: true } },
      },
    })

    return NextResponse.json({ data: shops, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch shops' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await getTenantId()
    if (!tenant) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const currentShopCount = await prisma.shop.count({
      where: { tenant_id: tenant.id },
    })

    if (currentShopCount >= tenant.shop_limit) {
      return NextResponse.json(
        { data: null, error: 'Shop limit reached. Contact us to add more shops.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const address = typeof body.address === 'string' ? body.address.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

    if (!name) {
      return NextResponse.json({ data: null, error: 'Shop name is required' }, { status: 400 })
    }

    const shop = await prisma.shop.create({
      data: {
        tenant_id: tenant.id,
        name,
        address: address || null,
        phone: phone || null,
        is_active: true,
      },
    })

    return NextResponse.json({ data: shop, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to create shop' }, { status: 500 })
  }
}
