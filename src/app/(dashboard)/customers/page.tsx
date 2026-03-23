import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CustomersDataTable, type CustomerRow } from './CustomersDataTable'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

export default async function CustomersPage() {
  const { tenant } = await getTenantShopsAndActiveShop()

  if (!tenant) {
    return <main className="space-y-4">Unauthorized</main>
  }

  const customers = (await prisma.customer.findMany({
    where: { tenant_id: tenant.id },
    include: {
      _count: { select: { sales: true } },
      sales: { include: { advances: true } },
    },
    orderBy: { created_at: 'desc' },
  })) as unknown as Array<{
    id: string
    name: string
    photo_url: string | null
    mobile1: string
    risk_level: CustomerRow['risk_level']
    _count: { sales: number }
    sales: Array<{
      advances: Array<{ amount_paid: unknown; amount_repaid: unknown | null }>
    }>
  }>

  const rows: CustomerRow[] = customers.map((customer) => {
    const balance = customer.sales.reduce((sum, sale) => {
      const saleBalance = sale.advances.reduce((s2, a) => {
        const paid = toNumber(a.amount_paid)
        const repaid = a.amount_repaid ? toNumber(a.amount_repaid) : 0
        return s2 + (paid - repaid)
      }, 0)
      return sum + saleBalance
    }, 0)

    return {
      id: customer.id,
      name: customer.name,
      photo_url: customer.photo_url,
      mobile1: customer.mobile1,
      risk_level: customer.risk_level,
      salesCount: customer._count.sales,
      balance,
      search: `${customer.name} ${customer.mobile1}`,
    }
  })

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Customers</h2>
        <Button asChild>
          <Link href="/customers/new">New Customer</Link>
        </Button>
      </div>

      <CustomersDataTable customers={rows} />
    </main>
  )
}
