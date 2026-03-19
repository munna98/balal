'use client'

import { useMemo, useState } from 'react'
import type { Customer } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CustomerForm } from '@/components/customers/CustomerForm'

export function SecondPartySelector({
  customers,
  selectedCustomerId,
  enabled,
  onEnabledChange,
  onSelect,
}: {
  customers: Customer[]
  selectedCustomerId: string | null
  enabled: boolean
  onEnabledChange: (value: boolean) => void
  onSelect: (customerId: string | null) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [localCustomers, setLocalCustomers] = useState(customers)

  const filtered = useMemo(
    () =>
      localCustomers.filter((customer) =>
        `${customer.name} ${customer.mobile1}`.toLowerCase().includes(query.toLowerCase())
      ),
    [localCustomers, query]
  )

  async function createCustomer(values: { name: string; mobile1: string; aadhaar?: string }) {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const json = (await response.json()) as { data?: { customer?: Customer } }
    if (!response.ok || !json.data?.customer) return
    setLocalCustomers((prev) => [json.data!.customer!, ...prev])
    onSelect(json.data.customer.id)
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
          <Input
            placeholder="Search customer by name or mobile"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="max-h-52 space-y-1 overflow-y-auto rounded-md border p-2">
            {filtered.length ? (
              filtered.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className={`w-full rounded-md px-2 py-1 text-left text-sm hover:bg-muted ${
                    selectedCustomerId === customer.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onSelect(customer.id)}
                >
                  {customer.name} - {customer.mobile1}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No matching customers.</p>
            )}
          </div>
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
