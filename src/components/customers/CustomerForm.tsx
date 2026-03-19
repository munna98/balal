'use client'

import { useState } from 'react'
import type { Customer } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type CustomerFormSubmit = {
  name: string
  mobile1: string
  aadhaar?: string
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save customer',
}: {
  defaultValues?: Partial<Customer>
  onSubmit: (values: CustomerFormSubmit) => Promise<void> | void
  submitLabel?: string
}) {
  const [name, setName] = useState(defaultValues?.name || '')
  const [mobile1, setMobile1] = useState(defaultValues?.mobile1 || '')
  const [aadhaar, setAadhaar] = useState(defaultValues?.aadhaar || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    await onSubmit({ name, mobile1, aadhaar: aadhaar || undefined })
    setLoading(false)
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="customer-name">Name</Label>
        <Input id="customer-name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customer-mobile1">Mobile</Label>
        <Input
          id="customer-mobile1"
          value={mobile1}
          onChange={(event) => setMobile1(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customer-aadhaar">Aadhaar (optional)</Label>
        <Input id="customer-aadhaar" value={aadhaar} onChange={(event) => setAadhaar(event.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
