'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'

export function AdminNotesEditor({
  tenantId,
  initialValue,
}: {
  tenantId: string
  initialValue: string
}) {
  const [value, setValue] = useState(initialValue)
  const router = useRouter()

  async function saveNotes() {
    await fetch(`/api/admin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: value }),
    })
    router.refresh()
  }

  return (
    <Textarea
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={saveNotes}
      placeholder="Add internal notes about this tenant"
      rows={4}
    />
  )
}
