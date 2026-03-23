import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RiskBadge } from '@/components/customers/RiskBadge'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { AddAdvanceDialog } from '@/components/advances/AddAdvanceDialog'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

type SaleWithAdvancesAndShop = {
  id: string
  shop_id: string
  shop: { name: string }
  device_name: string
  loan_amount: unknown
  tenure_months: number
  emi_amount: unknown
  loan_issue_date: Date
  advances: {
    amount_paid: unknown
    amount_repaid: unknown | null
  }[]
}

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { tenant, activeShop } = await getTenantShopsAndActiveShop()

  if (!tenant || !activeShop) {
    return <main className="space-y-4">Unauthorized or no active shop</main>
  }

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, tenant_id: tenant.id },
    include: {
      sales: {
        include: { shop: true, advances: true },
        orderBy: { created_at: 'desc' },
      },
    },
  })

  if (!customer) {
    return <main className="space-y-4">Customer not found</main>
  }

  const sales = (customer.sales as unknown as SaleWithAdvancesAndShop[]).map((sale) => {
    const totalPaid = sale.advances.reduce((sum, a) => sum + toNumber(a.amount_paid), 0)
    const totalRepaid = sale.advances.reduce(
      (sum, a) => sum + (a.amount_repaid ? toNumber(a.amount_repaid) : 0),
      0
    )
    const balance = totalPaid - totalRepaid

    return { ...sale, balance, totalPaid, totalRepaid }
  })

  const totalOutstandingBalance = sales.reduce((sum, s) => sum + s.balance, 0)

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            {customer.photo_url ? <AvatarImage src={customer.photo_url} alt={customer.name} /> : null}
            <AvatarFallback>{customer.name.slice(0, 1)}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold">{customer.name}</h2>
              <RiskBadge riskLevel={customer.risk_level} />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Mobile 1:</span> {customer.mobile1}
              </div>
              {customer.mobile2 ? (
                <div>
                  <span className="font-medium text-foreground">{customer.mobile2_label || 'Father'}:</span> {customer.mobile2}
                </div>
              ) : null}
              {customer.mobile3 ? (
                <div>
                  <span className="font-medium text-foreground">{customer.mobile3_label || 'Mother'}:</span> {customer.mobile3}
                </div>
              ) : null}
              {customer.mobile4 ? (
                <div>
                  <span className="font-medium text-foreground">{customer.mobile4_label || 'Friend'}:</span> {customer.mobile4}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="text-sm text-muted-foreground">
            Total outstanding balance
          </div>
          <div className={`text-2xl font-semibold ${totalOutstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalOutstandingBalance.toFixed(2)}
          </div>
          <Button asChild variant="outline">
            <Link href={`/customers/${customer.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sales.map((sale) => (
                <Card key={sale.id} className="flex flex-col h-full bg-muted/30">
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{sale.shop.name}</div>
                        <div className="text-xs text-muted-foreground">{sale.device_name}</div>
                      </div>
                      <div className={`text-sm font-semibold ${sale.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Balance: {sale.balance.toFixed(2)}
                      </div>
                    </div>

                    <Table className="pointer-events-none">
                      <TableBody>
                        <TableRow className="border-none hover:bg-transparent">
                          <TableCell className="p-1 pb-0.5 text-xs text-muted-foreground">Loan</TableCell>
                          <TableCell className="p-1 pb-0.5 text-xs font-medium text-right">{toNumber(sale.loan_amount).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow className="border-none hover:bg-transparent">
                          <TableCell className="p-1 pb-0.5 text-xs text-muted-foreground">Tenure</TableCell>
                          <TableCell className="p-1 pb-0.5 text-xs font-medium text-right">{sale.tenure_months} mo</TableCell>
                        </TableRow>
                        <TableRow className="border-none hover:bg-transparent">
                          <TableCell className="p-1 pb-0.5 text-xs text-muted-foreground">EMI</TableCell>
                          <TableCell className="p-1 pb-0.5 text-xs font-medium text-right">{toNumber(sale.emi_amount).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow className="border-none hover:bg-transparent">
                          <TableCell className="p-1 pb-0.5 text-xs text-muted-foreground">Date</TableCell>
                          <TableCell className="p-1 pb-0.5 text-xs font-medium text-right">{format(new Date(sale.loan_issue_date), 'dd MMM yy')}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <CardFooter className="p-4 pt-0">
                    <div className="w-full flex gap-2">
                      <Button asChild variant="outline" className="flex-1 bg-background" size="sm">
                        <Link href={`/sales/${sale.id}`}>View Details</Link>
                      </Button>
                      {sale.shop_id === activeShop.id && (
                        <div className="flex-1">
                          {/* Force full width string on button inside dialog */}
                          <div className="[&>button]:w-full [&>button]">
                            <AddAdvanceDialog saleId={sale.id} shopId={activeShop.id} />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">No sales found.</div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
