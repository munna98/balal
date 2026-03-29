'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaymentForm, type PaymentFormValues } from '@/components/payments/PaymentForm'

export type PaymentLedgerItem = {
  id: string
  paid_date: string | Date
  amount_paid: number | { toNumber: () => number }
  repaid_date: string | Date | null
  amount_repaid: number | null | { toNumber: () => number }
  note: string | null
}

function toNumber(value: number | { toNumber: () => number }) {
  return typeof value === 'number' ? value : value.toNumber()
}

export function PaymentLedger({
  payments,
}: {
  payments: PaymentLedgerItem[]
}) {
  const router = useRouter()
  const [activePayment, setActivePayment] = useState<PaymentLedgerItem | null>(null)

  const rows = useMemo(
    () =>
      payments.map((payment) => {
        const paid = toNumber(payment.amount_paid)
        const repaid = payment.amount_repaid ? toNumber(payment.amount_repaid) : 0
        return {
          ...payment,
          paid,
          repaid,
          balance: paid - repaid,
        }
      }),
    [payments]
  )

  const totals = useMemo(() => {
    const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0)
    const totalRepaid = rows.reduce((sum, row) => sum + row.repaid, 0)
    return { totalPaid, totalRepaid, outstanding: totalPaid - totalRepaid }
  }, [rows])

  async function saveRepayment(values: PaymentFormValues) {
    if (!activePayment) return
    await fetch(`/api/payments/${activePayment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setActivePayment(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border bg-background p-3 shadow-sm">
            <div className="space-y-3">
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Date paid</div>
                <div className="text-right">{format(new Date(row.paid_date), 'dd MMM yyyy')}</div>
              </div>
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Amount paid</div>
                <div className="text-right">{row.paid.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Date repaid</div>
                <div className="text-right">{row.repaid_date ? format(new Date(row.repaid_date), 'dd MMM yyyy') : '-'}</div>
              </div>
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Amount repaid</div>
                <div className="text-right">{row.repaid ? row.repaid.toFixed(2) : '-'}</div>
              </div>
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Balance</div>
                <div className={`text-right ${row.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{row.balance.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Note</div>
                <div className="text-right break-words">{row.note || '-'}</div>
              </div>
              <div className="flex justify-end pt-1">
                <Button type="button" size="sm" variant="outline" onClick={() => setActivePayment(row)}>
                  Mark Repayment
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">Total paid</span>
              <span className="font-semibold">{totals.totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">Total repaid</span>
              <span className="font-semibold">{totals.totalRepaid.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">Outstanding</span>
              <span className={`font-semibold ${totals.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totals.outstanding.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date paid</TableHead>
              <TableHead>Amount paid</TableHead>
              <TableHead>Date repaid</TableHead>
              <TableHead>Amount repaid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{format(new Date(row.paid_date), 'dd MMM yyyy')}</TableCell>
                <TableCell>{row.paid.toFixed(2)}</TableCell>
                <TableCell>{row.repaid_date ? format(new Date(row.repaid_date), 'dd MMM yyyy') : '-'}</TableCell>
                <TableCell>{row.repaid ? row.repaid.toFixed(2) : '-'}</TableCell>
                <TableCell className={row.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                  {row.balance.toFixed(2)}
                </TableCell>
                <TableCell>{row.note || '-'}</TableCell>
                <TableCell>
                  <Button type="button" size="sm" variant="outline" onClick={() => setActivePayment(row)}>
                    Mark Repayment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">Totals</TableCell>
              <TableCell className="font-semibold">{totals.totalPaid.toFixed(2)}</TableCell>
              <TableCell />
              <TableCell className="font-semibold">{totals.totalRepaid.toFixed(2)}</TableCell>
              <TableCell className={`font-semibold ${totals.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totals.outstanding.toFixed(2)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={Boolean(activePayment)} onOpenChange={(open) => (!open ? setActivePayment(null) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark repayment</DialogTitle>
            <DialogDescription>Update repayment details for this payment.</DialogDescription>
          </DialogHeader>
          {activePayment ? <PaymentForm payment={activePayment} onSubmit={saveRepayment} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
