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
import { EmiCoverForm, type EmiCoverFormValues } from '@/components/emi-covers/EmiCoverForm'

export function AddEmiCoverDialog({ saleId, shopId }: { saleId: string; shopId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function addEmiCover(values: EmiCoverFormValues) {
    if (!values.paid_date || typeof values.amount_paid !== 'number') return

    const res = await fetch('/api/emi-covers', {
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
        Add EMI Cover
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add EMI cover</DialogTitle>
            <DialogDescription>Record a new EMI cover for this loan.</DialogDescription>
          </DialogHeader>
          <EmiCoverForm mode="create" onSubmit={addEmiCover} />
        </DialogContent>
      </Dialog>
    </>
  )
}

