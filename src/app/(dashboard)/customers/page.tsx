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

const PAGE_SIZE = 20

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { tenant } = await getTenantShopsAndActiveShop()

  if (!tenant) {
    return <main className="space-y-4">Unauthorized</main>
  }

  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const skip = (currentPage - 1) * PAGE_SIZE

  // Optimized: Fetch just the summary data we need
  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where: { tenant_id: tenant.id },
      select: {
        id: true,
        name: true,
        photo_url: true,
        mobile1: true,
        risk_level: true,
        _count: { select: { sales: true } },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.customer.count({ where: { tenant_id: tenant.id } }),
  ])

  // For balance calculation, fetch only the minimal data needed
  const customersWithBalance = await Promise.all(
    customers.map(async (customer) => {
      const sales = await prisma.sale.findMany({
        where: { customer_id: customer.id },
        select: {
          payments: { select: { amount_paid: true, amount_repaid: true } },
        },
      })

      const balance = sales.reduce((sum, sale) => {
        const saleBalance = sale.payments.reduce((s2, a) => {
          const paid = toNumber(a.amount_paid)
          const repaid = a.amount_repaid ? toNumber(a.amount_repaid) : 0
          return s2 + (paid - repaid)
        }, 0)
        return sum + saleBalance
      }, 0)

      return { ...customer, balance }
    }),
  )

  const rows: CustomerRow[] = customersWithBalance.map((customer) => ({
    id: customer.id,
    name: customer.name,
    photo_url: customer.photo_url,
    mobile1: customer.mobile1,
    risk_level: customer.risk_level,
    salesCount: customer._count.sales,
    balance: customer.balance,
    search: `${customer.name} ${customer.mobile1}`,
  }))

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Customers ({totalCount} total)</h2>
        <Button asChild>
          <Link href="/customers/new">New Customer</Link>
        </Button>
      </div>

      <CustomersDataTable customers={rows} />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button asChild variant="outline">
                <Link href={`/customers?page=${currentPage - 1}`}>← Previous</Link>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button asChild variant="outline">
                <Link href={`/customers?page=${currentPage + 1}`}>Next →</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
