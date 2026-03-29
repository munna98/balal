'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: value }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error((json as { error?: string }).error || 'Failed to save notes')
      return
    }
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
