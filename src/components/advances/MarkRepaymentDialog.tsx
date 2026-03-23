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

export function MarkRepaymentDialog({ advance }: { advance: { id: string; note?: string | null } }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function save(values: AdvanceFormValues) {
    const res = await fetch(`/api/advances/${advance.id}`, {
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
            <DialogDescription>Update repayment details for this advance.</DialogDescription>
          </DialogHeader>
          <AdvanceForm mode="repayment" advance={advance} onSubmit={save} />
        </DialogContent>
      </Dialog>
    </>
  )
}

