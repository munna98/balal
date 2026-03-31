'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CustomerForm, type CustomerFormSubmit } from '@/components/customers/CustomerForm'
import { CustomerLookupField, type CustomerLookupItem } from '@/components/customers/CustomerLookupField'
import { useTenantFromDashboard } from '@/components/layout/active-shop-context'
import { ResponsiveSheetDrawer } from '@/components/shared/ResponsiveSheetDrawer'

export function SecondPartySelector({
  selectedCustomer,
  excludedCustomerIds = [],
  enabled,
  onEnabledChange,
  onSelect,
  customers,
  onCustomerCreated,
}: {
  selectedCustomer: CustomerLookupItem | null
  excludedCustomerIds?: string[]
  enabled: boolean
  onEnabledChange: (value: boolean) => void
  onSelect: (customer: CustomerLookupItem | null) => void
  customers?: CustomerLookupItem[]
  onCustomerCreated?: (customer: CustomerLookupItem) => void
}) {
  const [open, setOpen] = useState(false)
  const tenant = useTenantFromDashboard()

  async function createCustomer(values: CustomerFormSubmit) {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name.trim(),
        mobile1: values.mobile1.trim(),
        aadhaar: values.aadhaar?.trim() || undefined,
        risk_level: values.risk_level,
        mobile2: values.mobile2?.trim() || undefined,
        mobile2_label: values.mobile2_label?.trim() || undefined,
        mobile3: values.mobile3?.trim() || undefined,
        mobile3_label: values.mobile3_label?.trim() || undefined,
        mobile4: values.mobile4?.trim() || undefined,
        mobile4_label: values.mobile4_label?.trim() || undefined,
      }),
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

    let customer = json.data.customer

    if (values.photoFile && tenant?.id) {
      const supabase = createClient()
      const path = `${tenant.id}/customers/${customer.id}/photo.jpg`
      const { error: uploadError } = await supabase.storage.from('shop-assets').upload(path, values.photoFile, {
        upsert: true,
        contentType: values.photoFile.type || 'image/jpeg',
      })

      if (!uploadError) {
        const { data } = supabase.storage.from('shop-assets').getPublicUrl(path)
        const photoUrl = data.publicUrl
        const updateRes = await fetch(`/api/customers/${customer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo_url: photoUrl }),
        })

        if (updateRes.ok) {
          customer = { ...customer, photo_url: photoUrl }
        }
      }
    }

    onCustomerCreated?.(customer)
    onSelect(customer)
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
            customers={customers}
            action={
              <Button type="button" variant="outline" size="icon" className="sm:w-auto sm:px-3" onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Create new customer</span>
              </Button>
            }
          />
        </div>
      ) : null}

      <ResponsiveSheetDrawer
        open={open}
        onOpenChange={setOpen}
        title="Create new customer"
        description="Customer will be auto-selected after creation."
      >
        <CustomerForm onSubmit={createCustomer} submitLabel="Create and select customer" />
      </ResponsiveSheetDrawer>
    </div>
  )
}
