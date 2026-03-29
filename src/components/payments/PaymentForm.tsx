'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type PaymentFormValues = {
  paid_date?: string
  amount_paid?: number
  repaid_date?: string
  amount_repaid?: number
  note?: string
}

type PaymentLike = {
  note?: string | null
}

export function PaymentForm({
  payment,
  mode = 'repayment',
  onSubmit,
}: {
  payment?: PaymentLike
  mode?: 'create' | 'repayment'
  onSubmit: (values: PaymentFormValues) => Promise<void> | void
}) {
  const [paidDate, setPaidDate] = useState('')
  const [amountPaid, setAmountPaid] = useState('')

  const [repaidDate, setRepaidDate] = useState('')
  const [amountRepaid, setAmountRepaid] = useState('')

  const [note, setNote] = useState(payment?.note || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    if (mode === 'create') {
      await onSubmit({
        paid_date: paidDate || undefined,
        amount_paid: amountPaid ? Number(amountPaid) : undefined,
        note: note || undefined,
      })
    } else {
      await onSubmit({
        repaid_date: repaidDate || undefined,
        amount_repaid: amountRepaid ? Number(amountRepaid) : undefined,
        note: note || undefined,
      })
    }
    setLoading(false)
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {mode === 'create' ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="paid-date">Date paid</Label>
            <Input id="paid-date" type="date" value={paidDate} onChange={(event) => setPaidDate(event.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount-paid">Amount paid</Label>
            <Input
              id="amount-paid"
              type="number"
              min="1"
              step="0.01"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="repaid-date">Date repaid</Label>
            <Input id="repaid-date" type="date" value={repaidDate} onChange={(event) => setRepaidDate(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount-repaid">Amount repaid</Label>
            <Input
              id="amount-repaid"
              type="number"
              min="0"
              value={amountRepaid}
              onChange={(event) => setAmountRepaid(event.target.value)}
            />
          </div>
        </>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : mode === 'create' ? 'Add Payment' : 'Save repayment'}
      </Button>
    </form>
  )
}
