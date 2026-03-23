'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { CustomerLookupField, type CustomerLookupItem } from '@/components/customers/CustomerLookupField'

export function SecondPartySelector({
  selectedCustomer,
  excludedCustomerIds = [],
  enabled,
  onEnabledChange,
  onSelect,
}: {
  selectedCustomer: CustomerLookupItem | null
  excludedCustomerIds?: string[]
  enabled: boolean
  onEnabledChange: (value: boolean) => void
  onSelect: (customer: CustomerLookupItem | null) => void
}) {
  const [open, setOpen] = useState(false)

  async function createCustomer(values: { name: string; mobile1: string; aadhaar?: string }) {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const json = (await response.json()) as {
      data?: {
        customer?: {
          id: string
          name: string
          mobile1: string
          photo_url: string | null
          risk_level: CustomerLookupItem['risk_level']
        }
      }
    }

    if (!response.ok || !json.data?.customer) return

    onSelect(json.data.customer)
    setOpen(false)
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="second-party-switch">Loan is under a different person&apos;s name</Label>
        <Switch
          id="second-party-switch"
          checked={enabled}
          onCheckedChange={(checked) => {
            onEnabledChange(Boolean(checked))
            if (!checked) onSelect(null)
          }}
        />
      </div>

      {enabled ? (
        <div className="space-y-2">
          <CustomerLookupField
            label="Second party customer"
            selectedCustomer={selectedCustomer}
            onSelect={onSelect}
            excludeIds={excludedCustomerIds}
          />
          <Button type="button" variant="outline" onClick={() => setOpen(true)}>
            Create new customer
          </Button>
        </div>
      ) : null}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create new customer</SheetTitle>
            <SheetDescription>Customer will be auto-selected after creation.</SheetDescription>
          </SheetHeader>
          <div className="p-6 pt-0">
            <CustomerForm onSubmit={createCustomer} submitLabel="Create and select customer" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
