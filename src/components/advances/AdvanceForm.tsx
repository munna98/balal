'use client'

import { useState } from 'react'
import type { Advance } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type AdvanceFormValues = {
  repaid_date?: string
  amount_repaid?: number
  note?: string
}

export function AdvanceForm({
  advance,
  onSubmit,
}: {
  advance: Advance
  onSubmit: (values: AdvanceFormValues) => Promise<void> | void
}) {
  const [repaidDate, setRepaidDate] = useState('')
  const [amountRepaid, setAmountRepaid] = useState('')
  const [note, setNote] = useState(advance.note || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    await onSubmit({
      repaid_date: repaidDate || undefined,
      amount_repaid: amountRepaid ? Number(amountRepaid) : undefined,
      note: note || undefined,
    })
    setLoading(false)
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
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
      <div className="space-y-1.5">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save repayment'}
      </Button>
    </form>
  )
}
