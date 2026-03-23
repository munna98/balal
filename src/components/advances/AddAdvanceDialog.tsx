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
import { AdvanceForm, type AdvanceFormValues } from '@/components/advances/AdvanceForm'

export function AddAdvanceDialog({ saleId, shopId }: { saleId: string; shopId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function addAdvance(values: AdvanceFormValues) {
    if (!values.paid_date || typeof values.amount_paid !== 'number') return

    const res = await fetch('/api/advances', {
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
      <Button type="button" onClick={() => setOpen(true)} variant="outline">
        Add Advance
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add advance</DialogTitle>
            <DialogDescription>Record a new advance for this loan.</DialogDescription>
          </DialogHeader>
          <AdvanceForm mode="create" onSubmit={addAdvance} />
        </DialogContent>
      </Dialog>
    </>
  )
}

