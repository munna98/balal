import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { Button } from '@/components/ui/button'
import { SalesDataTable, type SaleRow } from './SalesDataTable'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

type SaleForList = {
  id: string
  customer: { name: string; mobile1: string }
  device_name: string
  imei: string | null
  loan_amount: unknown
  emi_amount: unknown
  tenure_months: number
  loan_issue_date: Date
  emi_covers: { amount_paid: unknown; amount_repaid: unknown | null }[]
}

export default async function SalesPage(props: { searchParams?: Promise<{ has_outstanding_emiCover?: string }> }) {
  const searchParams = await props.searchParams
  const { tenant, activeShop } = await getTenantShopsAndActiveShop()

  if (!tenant) return <main className="space-y-4">Unauthorized</main>
  if (!activeShop) return <main className="space-y-4">No active shop configured.</main>

  const hasOutstanding = searchParams?.has_outstanding_emiCover === 'true'

  const sales = (await prisma.sale.findMany({
    where: { shop_id: activeShop.id },
    include: {
      customer: { select: { id: true, name: true, mobile1: true } },
      emi_covers: { select: { amount_paid: true, amount_repaid: true } },
    },
    orderBy: { loan_issue_date: 'desc' },
  })) as unknown as SaleForList[]

  const rows: SaleRow[] = sales
    .map((sale) => {
      const balance = sale.emi_covers.reduce((sum, a) => {
        const paid = toNumber(a.amount_paid)
        const repaid = a.amount_repaid ? toNumber(a.amount_repaid) : 0
        return sum + (paid - repaid)
      }, 0)

      return {
        id: sale.id,
        customerName: sale.customer.name,
        customerMobile1: sale.customer.mobile1,
        deviceName: sale.device_name,
        imei: sale.imei,
        loanAmount: toNumber(sale.loan_amount),
        emiAmount: toNumber(sale.emi_amount),
        tenureMonths: sale.tenure_months,
        loanIssueDate: new Date(sale.loan_issue_date).toISOString(),
        balance,
      }
    })
    .filter((row) => (hasOutstanding ? row.balance > 0 : true))

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant={hasOutstanding ? 'outline' : 'default'} size="sm">
            <Link href="/sales">All</Link>
          </Button>
          <Button asChild variant={hasOutstanding ? 'default' : 'outline'} size="sm">
            <Link href="/sales?has_outstanding_emiCover=true">Has Outstanding EmiCover</Link>
          </Button>
        </div>

        <Button asChild size="sm">
          <Link href="/sales/new">New Sale</Link>
        </Button>
      </div>

      <SalesDataTable rows={rows} shopId={activeShop.id} />
    </main>
  )
}
