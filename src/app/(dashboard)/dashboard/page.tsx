import { format } from 'date-fns'
import { addMonths, startOfMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

type SaleForTopCustomer = {
  customer_id: string
  customer: { id: string; name: string; mobile1: string }
  advances: { amount_paid: unknown; amount_repaid: unknown | null }[]
}

type LastSaleRow = {
  id: string
  device_name: string
  emi_amount: unknown
  loan_issue_date: Date
  customer: { name: string }
}

export default async function DashboardPage() {
  const { tenant, activeShop } = await getTenantShopsAndActiveShop()

  if (!tenant) {
    return <main className="space-y-4">Unauthorized</main>
  }

  if (!activeShop) {
    return <main className="space-y-4">No active shop configured.</main>
  }

  const totalCustomers = await prisma.customer.count({ where: { tenant_id: tenant.id } })
  const totalDangerWarningCustomers = await prisma.customer.count({
    where: { tenant_id: tenant.id, risk_level: { in: ['DANGER', 'WARNING'] } },
  })

  const thisMonthStart = startOfMonth(new Date())
  const nextMonthStart = addMonths(thisMonthStart, 1)

  const totalSalesThisMonth = await prisma.sale.count({
    where: {
      shop_id: activeShop.id,
      loan_issue_date: { gte: thisMonthStart, lt: nextMonthStart },
    },
  })

  const shopAdvances = (await prisma.advance.findMany({
    where: { shop_id: activeShop.id },
    select: { amount_paid: true, amount_repaid: true },
  })) as unknown as Array<{ amount_paid: unknown; amount_repaid: unknown | null }>
  const outstandingAdvanceBalance = shopAdvances.reduce((sum, a) => {
    const paid = toNumber(a.amount_paid)
    const repaid = a.amount_repaid ? toNumber(a.amount_repaid) : 0
    return sum + (paid - repaid)
  }, 0)

  const lastSales = (await prisma.sale.findMany({
    where: { shop_id: activeShop.id },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { loan_issue_date: 'desc' },
    take: 5,
  })) as unknown as LastSaleRow[]

  const salesForTopCustomers = (await prisma.sale.findMany({
    where: { shop_id: activeShop.id },
    select: {
      customer_id: true,
      customer: { select: { id: true, name: true, mobile1: true } },
      advances: { select: { amount_paid: true, amount_repaid: true } },
    },
  })) as unknown as SaleForTopCustomer[]

  const outstandingByCustomer = new Map<
    string,
    { id: string; name: string; mobile1: string; balance: number }
  >()

  for (const sale of salesForTopCustomers) {
    const saleBalance = sale.advances.reduce((sum, a) => {
      const paid = toNumber(a.amount_paid)
      const repaid = a.amount_repaid ? toNumber(a.amount_repaid) : 0
      return sum + (paid - repaid)
    }, 0)

    const existing = outstandingByCustomer.get(sale.customer_id)
    if (existing) {
      existing.balance += saleBalance
    } else {
      outstandingByCustomer.set(sale.customer_id, {
        id: sale.customer_id,
        name: sale.customer.name,
        mobile1: sale.customer.mobile1,
        balance: saleBalance,
      })
    }
  }

  const topCustomers = Array.from(outstandingByCustomer.values())
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)

  return (
    <main className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total customers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalCustomers}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total sales this month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalSalesThisMonth}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Outstanding advance balance</CardTitle>
          </CardHeader>
          <CardContent className={`text-2xl font-semibold ${outstandingAdvanceBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {outstandingAdvanceBalance.toFixed(2)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              DANGER + WARNING customers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalDangerWarningCustomers}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Last 5 sales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3 md:hidden">
            {lastSales.length ? (
              lastSales.map((sale) => (
                <div key={sale.id} className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="space-y-3">
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Customer</div>
                      <div className="text-right font-medium">{sale.customer.name}</div>
                    </div>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Device</div>
                      <div className="text-right break-words">{sale.device_name}</div>
                    </div>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">EMI</div>
                      <div className="text-right">{toNumber(sale.emi_amount).toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Date</div>
                      <div className="text-right">{format(new Date(sale.loan_issue_date), 'dd MMM yyyy')}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No sales yet.</div>
            )}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lastSales.length ? (
                  lastSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="font-medium">{sale.customer.name}</div>
                      </TableCell>
                      <TableCell>{sale.device_name}</TableCell>
                      <TableCell>{toNumber(sale.emi_amount).toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(sale.loan_issue_date), 'dd MMM yyyy')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No sales yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Top 5 customers by outstanding balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {topCustomers.length ? (
              topCustomers.map((customer) => (
                <div key={customer.id} className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="space-y-3">
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Customer</div>
                      <div className="text-right font-medium">{customer.name}</div>
                    </div>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Mobile</div>
                      <div className="text-right text-muted-foreground">{customer.mobile1}</div>
                    </div>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Outstanding</div>
                      <div className={`text-right ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {customer.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No outstanding advances yet.
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.length ? (
                  topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.mobile1}</TableCell>
                      <TableCell className={customer.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {customer.balance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No outstanding advances yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
