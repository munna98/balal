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

export function AddPaymentDialog({ saleId, shopId }: { saleId: string; shopId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function addPayment(values: PaymentFormValues) {
    if (!values.paid_date || typeof values.amount_paid !== 'number') return

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sale_id: saleId,
        shop_id: shopId,
        paid_date: values.paid_date,
        amount_paid: values.amount_paid,
        note: values.note || null,
      }),
    })

    if (!res.ok) return

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} variant="outline" size="sm" className="w-full">
        Add Payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>Record a new payment for this loan.</DialogDescription>
          </DialogHeader>
          <PaymentForm mode="create" onSubmit={addPayment} />
        </DialogContent>
      </Dialog>
    </>
  )
}

