'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PaymentForm, type PaymentFormValues } from '@/components/payments/PaymentForm'

export function MarkRepaymentDialog({ payment }: { payment: { id: string; note?: string | null } }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function save(values: PaymentFormValues) {
    const res = await fetch(`/api/payments/${payment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) return

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Mark Repayment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark repayment</DialogTitle>
            <DialogDescription>Update repayment details for this payment.</DialogDescription>
          </DialogHeader>
          <PaymentForm mode="repayment" payment={payment} onSubmit={save} />
        </DialogContent>
      </Dialog>
    </>
  )
}

