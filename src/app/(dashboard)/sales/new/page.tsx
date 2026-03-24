import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { CustomerLookupItem } from '@/components/customers/CustomerLookupField'
import NewSalePageClient from './NewSalePageClient'

async function getLookupCustomers(): Promise<CustomerLookupItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const tenant = await prisma.tenant.findUnique({
    where: { supabase_user_id: user.id },
    select: { id: true },
  })

  if (!tenant) return []

  return prisma.customer.findMany({
    where: { tenant_id: tenant.id },
    select: {
      id: true,
      name: true,
      mobile1: true,
      photo_url: true,
      risk_level: true,
    },
    orderBy: { created_at: 'desc' },
  })
}

export default async function NewSalePage() {
  const customers = await getLookupCustomers()

  return <NewSalePageClient customers={customers} />
}
