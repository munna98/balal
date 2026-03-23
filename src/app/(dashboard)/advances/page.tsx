import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { Button } from '@/components/ui/button'
import { AdvancesDataTable, type AdvanceRow } from './AdvancesDataTable'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

type AdvanceWithSale = {
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

export default async function AdvancesPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const { tenant, activeShop } = await getTenantShopsAndActiveShop()

  if (!tenant) return <main className="space-y-4">Unauthorized</main>
  if (!activeShop) return <main className="space-y-4">No active shop configured.</main>

  const tab = searchParams?.tab === 'settled' ? 'settled' : 'outstanding'

  const advances = (await prisma.advance.findMany({
    where: { shop_id: activeShop.id },
    include: {
      sale: {
        include: {
          customer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { paid_date: 'desc' },
  })) as unknown as AdvanceWithSale[]

  const rows: AdvanceRow[] = advances.map((adv) => {
    const paid = toNumber(adv.amount_paid)
    const repaid = adv.amount_repaid ? toNumber(adv.amount_repaid) : null
    const balance = paid - (repaid ?? 0)

    return {
      id: adv.id,
      customerName: adv.sale.customer.name,
      deviceName: adv.sale.device_name,
      paidDate: new Date(adv.paid_date).toISOString(),
      paidByShop: paid,
      repaidAmount: repaid,
      balance,
      note: adv.note,
    }
  })

  const filtered = tab === 'settled' ? rows.filter((r) => r.balance <= 0) : rows.filter((r) => r.balance > 0)

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant={tab === 'outstanding' ? 'default' : 'outline'}>
            <Link href="/advances?tab=outstanding">Outstanding</Link>
          </Button>
          <Button asChild size="sm" variant={tab === 'settled' ? 'default' : 'outline'}>
            <Link href="/advances?tab=settled">Settled</Link>
          </Button>
        </div>
      </div>

      <AdvancesDataTable rows={filtered} />
    </main>
  )
}
