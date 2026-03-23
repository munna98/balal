import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
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
    const search = (searchParams.get('search') || '').trim()
    const mode = searchParams.get('mode')
    const limitParam = Number(searchParams.get('limit') || '')
    const take = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : undefined

    const args: Prisma.CustomerFindManyArgs = {
      where: {
        tenant_id: tenantId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { mobile1: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { created_at: 'desc' },
      ...(take ? { take } : {}),
      ...(mode === 'lookup'
        ? {
            select: {
              id: true,
              name: true,
              photo_url: true,
              mobile1: true,
              risk_level: true,
            },
          }
        : {
            include: {
              _count: { select: { sales: true } },
            },
          }),
    }

    const customers = await prisma.customer.findMany(args)

    return NextResponse.json({ data: customers, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const aadhaar = typeof body.aadhaar === 'string' ? body.aadhaar.trim() : ''
    const mobile1 = typeof body.mobile1 === 'string' ? body.mobile1.trim() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!name || !mobile1) {
      return NextResponse.json(
        { data: null, error: 'Name and mobile1 are required' },
        { status: 400 }
      )
    }

    if (aadhaar) {
      const existingByAadhaar = await prisma.customer.findFirst({
        where: { tenant_id: tenantId, aadhaar },
        select: { id: true },
      })
      if (existingByAadhaar) {
        return NextResponse.json(
          { data: { existingCustomerId: existingByAadhaar.id }, error: 'Duplicate aadhaar' },
          { status: 409 }
        )
      }
    }

    const duplicateMobile = await prisma.customer.findFirst({
      where: { tenant_id: tenantId, mobile1 },
      select: { id: true },
    })

    const customer = await prisma.customer.create({
      data: {
        tenant_id: tenantId,
        name,
        aadhaar: aadhaar || null,
        photo_url: typeof body.photo_url === 'string' && body.photo_url ? body.photo_url : null,
        mobile1,
        mobile2: typeof body.mobile2 === 'string' && body.mobile2 ? body.mobile2 : null,
        mobile2_label:
          typeof body.mobile2_label === 'string' && body.mobile2_label ? body.mobile2_label : 'Father',
        mobile3: typeof body.mobile3 === 'string' && body.mobile3 ? body.mobile3 : null,
        mobile3_label:
          typeof body.mobile3_label === 'string' && body.mobile3_label ? body.mobile3_label : 'Mother',
        mobile4: typeof body.mobile4 === 'string' && body.mobile4 ? body.mobile4 : null,
        mobile4_label:
          typeof body.mobile4_label === 'string' && body.mobile4_label ? body.mobile4_label : 'Friend',
        risk_level: body.risk_level || 'NEUTRAL',
      },
    })

    return NextResponse.json({
      data: { customer, warning: duplicateMobile ? 'DUPLICATE_MOBILE1' : null },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to create customer' }, { status: 500 })
  }
}
