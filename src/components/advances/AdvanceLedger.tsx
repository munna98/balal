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
import { AdvanceForm, type AdvanceFormValues } from '@/components/advances/AdvanceForm'

export type AdvanceLedgerAdvance = {
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

export function AdvanceLedger({
  advances,
}: {
  advances: AdvanceLedgerAdvance[]
}) {
  const router = useRouter()
  const [activeAdvance, setActiveAdvance] = useState<AdvanceLedgerAdvance | null>(null)

  const rows = useMemo(
    () =>
      advances.map((advance) => {
        const paid = toNumber(advance.amount_paid)
        const repaid = advance.amount_repaid ? toNumber(advance.amount_repaid) : 0
        return {
          ...advance,
          paid,
          repaid,
          balance: paid - repaid,
        }
      }),
    [advances]
  )

  const totals = useMemo(() => {
    const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0)
    const totalRepaid = rows.reduce((sum, row) => sum + row.repaid, 0)
    return { totalPaid, totalRepaid, outstanding: totalPaid - totalRepaid }
  }, [rows])

  async function saveRepayment(values: AdvanceFormValues) {
    if (!activeAdvance) return
    await fetch(`/api/advances/${activeAdvance.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setActiveAdvance(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
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
                <Button type="button" size="sm" variant="outline" onClick={() => setActiveAdvance(row)}>
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

      <Dialog open={Boolean(activeAdvance)} onOpenChange={(open) => (!open ? setActiveAdvance(null) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark repayment</DialogTitle>
            <DialogDescription>Update repayment details for this advance.</DialogDescription>
          </DialogHeader>
          {activeAdvance ? <AdvanceForm advance={activeAdvance} onSubmit={saveRepayment} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
