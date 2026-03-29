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

export function MarkRepaymentDialog({ emiCover }: { emiCover: { id: string; note?: string | null } }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function save(values: EmiCoverFormValues) {
    const res = await fetch(`/api/emi-covers/${emiCover.id}`, {
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
            <DialogDescription>Update repayment details for this EMI cover.</DialogDescription>
          </DialogHeader>
          <EmiCoverForm mode="repayment" emiCover={emiCover} onSubmit={save} />
        </DialogContent>
      </Dialog>
    </>
  )
}

