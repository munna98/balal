import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const tenants = await prisma.tenant.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { shops: true, customers: true },
        },
      },
    })

    return NextResponse.json({ data: tenants, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Failed to fetch tenants' }, { status: 500 })
  }
}
