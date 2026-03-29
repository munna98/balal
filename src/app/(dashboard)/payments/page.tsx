import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { PaymentsDataTable, type PaymentRow } from './PaymentsDataTable'
import { PaymentsFilters } from './PaymentsFilters'
import {
  parseAging,
  parseTab,
  type AgingFilter,
} from './payments-search-params'

/** Calendar days from paid date through today (inclusive of both dates). */
function ageDaysFromPaidDate(paid: Date) {
  const p = new Date(paid.getFullYear(), paid.getMonth(), paid.getDate())
  const t = new Date()
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  return Math.round((today.getTime() - p.getTime()) / (1000 * 60 * 60 * 24))
}

function matchesAgingBucket(ageDays: number, aging: AgingFilter) {
  if (aging === 'all') return true
  if (aging === '0-30') return ageDays >= 0 && ageDays <= 30
  if (aging === '30-60') return ageDays > 30 && ageDays <= 60
  if (aging === '60-90') return ageDays > 60 && ageDays <= 90
  return ageDays > 90
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

type PaymentWithSale = {
  id: string
  note: string | null
  amount_paid: unknown
  amount_repaid: unknown | null
  paid_date: Date
  sale: {
    device_name: string
    customer: { name: string }
  }
}

export default async function PaymentsPage(props: { searchParams: Promise<{ tab?: string; aging?: string }> }) {
  const searchParams = await props.searchParams
  const { tenant, activeShop } = await getTenantShopsAndActiveShop()

  if (!tenant) return <main className="space-y-4">Unauthorized</main>
  if (!activeShop) return <main className="space-y-4">No active shop configured.</main>

  const tab = parseTab(searchParams?.tab)
  const aging = parseAging(searchParams?.aging)

  const payments = (await prisma.payment.findMany({
    where: { shop_id: activeShop.id },
    include: {
      sale: {
        include: {
          customer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { paid_date: 'desc' },
  })) as unknown as PaymentWithSale[]

  const rows: PaymentRow[] = payments.map((adv) => {
    const paid = toNumber(adv.amount_paid)
    const repaid = adv.amount_repaid ? toNumber(adv.amount_repaid) : null
    const balance = paid - (repaid ?? 0)
    const paidDate = new Date(adv.paid_date)

    return {
      id: adv.id,
      customerName: adv.sale.customer.name,
      deviceName: adv.sale.device_name,
      paidDate: paidDate.toISOString(),
      ageDays: ageDaysFromPaidDate(paidDate),
      paidByShop: paid,
      repaidAmount: repaid,
      balance,
      note: adv.note,
    }
  })

  const byTab =
    tab === 'all'
      ? rows
      : tab === 'settled'
        ? rows.filter((r) => r.balance <= 0)
        : rows.filter((r) => r.balance > 0)
  const filtered = byTab.filter((r) => matchesAgingBucket(r.ageDays, aging))

  return (
    <main className="space-y-4">
      <PaymentsFilters tab={tab} aging={aging} />

      <PaymentsDataTable rows={filtered} />
    </main>
  )
}
