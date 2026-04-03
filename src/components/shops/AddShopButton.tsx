'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type AddShopButtonProps = {
  atShopLimit: boolean
  shopLimit: number
}

export function AddShopButton({ atShopLimit, shopLimit }: AddShopButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleClick() {
    if (atShopLimit) {
      setOpen(true)
      return
    }

    router.push('/shops/new')
  }

  return (
    <>
      <Button type="button" onClick={handleClick}>
        Add shop
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shop limit reached</DialogTitle>
            <DialogDescription>
              You are using all {shopLimit} shop slot{shopLimit === 1 ? '' : 's'} on your plan. Contact support to add more.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  )
}
