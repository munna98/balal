import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { getTenantShopsAndActiveShop } from '@/lib/server/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskBadge } from '@/components/customers/RiskBadge'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { AddPaymentDialog } from '@/components/payments/AddPaymentDialog'
import { PaymentLedger } from '@/components/payments/PaymentLedger'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BackButton } from '@/components/shared/BackButton'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value)
}

type PaymentForSaleMapping = {
  id: string
  paid_date: Date
  amount_paid: unknown
  repaid_date: Date | null
  amount_repaid: unknown | null
  note: string | null
}

export default async function SaleDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { tenant } = await getTenantShopsAndActiveShop()

  if (!tenant) return <main className="space-y-4">Unauthorized</main>

  const sale = await prisma.sale.findFirst({
    where: { id: params.id, shop: { tenant_id: tenant.id } },
    include: {
      shop: true,
      customer: true,
      second_party_customer: true,
      payments: { orderBy: { paid_date: 'desc' } },
    },
  })

  if (!sale) return <main className="space-y-4">Sale not found</main>

  const paymentsForUI = (sale.payments as unknown as PaymentForSaleMapping[]).map((a) => ({
    ...a,
    amount_paid: toNumber(a.amount_paid),
    amount_repaid: a.amount_repaid ? toNumber(a.amount_repaid) : null,
    paid_date: new Date(a.paid_date).toISOString(),
    repaid_date: a.repaid_date ? new Date(a.repaid_date).toISOString() : null,
  }))

  const totalPaid = paymentsForUI.reduce((sum, a) => sum + (a.amount_paid as number), 0)
  const totalRepaid = paymentsForUI.reduce((sum, a) => sum + ((a.amount_repaid as number | null) || 0), 0)
  const paymentBalance = totalPaid - totalRepaid

  const secondPartyEnabled = Boolean(sale.is_second_party && sale.second_party_customer)
  const secondParty = sale.second_party_customer

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-2">
        <BackButton href="/sales" compact label="Back to sales" />
        <h1 className="text-xl font-semibold">Sale Details</h1>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-14">
            {sale.customer.photo_url ? <AvatarImage src={sale.customer.photo_url} alt={sale.customer.name} /> : null}
            <AvatarFallback>{sale.customer.name.slice(0, 1)}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold">{sale.customer.name}</h2>
              <RiskBadge riskLevel={sale.customer.risk_level} />
            </div>
            <div className="text-sm text-muted-foreground">
              Shop: <span className="font-medium text-foreground">{sale.shop.name}</span> · Date:{' '}
              {format(new Date(sale.loan_issue_date), 'dd MMM yyyy')}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <AddPaymentDialog saleId={sale.id} shopId={sale.shop_id} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Finance details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">Loan amount</TableCell>
                  <TableCell className="py-2 font-medium">{toNumber(sale.loan_amount).toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">Down payment</TableCell>
                  <TableCell className="py-2 font-medium">{toNumber(sale.down_payment).toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">Tenure</TableCell>
                  <TableCell className="py-2 font-medium">{sale.tenure_months} months</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">EMI</TableCell>
                  <TableCell className="py-2 font-medium">{toNumber(sale.emi_amount).toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">Payment balance</TableCell>
                  <TableCell
                    className={`py-2 font-semibold ${
                      paymentBalance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {paymentBalance.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Product details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">Device</TableCell>
                  <TableCell className="py-2 font-medium">{sale.device_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">IMEI</TableCell>
                  <TableCell className="py-2 font-medium">{sale.imei || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 pr-4 text-muted-foreground">Reference</TableCell>
                  <TableCell className="py-2 font-medium">{sale.reference_number || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {secondPartyEnabled ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Second party</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="font-medium">{secondParty!.name}</div>
              <div className="text-sm text-muted-foreground">{secondParty!.mobile1}</div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {sale.co_name || sale.notes ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Care Of & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sale.co_name ? (
              <div className="space-y-1">
                <div className="text-sm font-medium">{sale.co_name}</div>
                {sale.co_mobile ? <div className="text-sm text-muted-foreground">{sale.co_mobile}</div> : null}
              </div>
            ) : null}

            {sale.notes ? <div className="whitespace-pre-wrap text-sm">{sale.notes}</div> : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Payment ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentLedger payments={paymentsForUI} />
        </CardContent>
      </Card>
    </main>
  )
}
