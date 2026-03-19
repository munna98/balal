'use client'

import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

type Status = 'ACTIVE' | 'TRIAL' | 'SUSPENDED'

export function TenantStatusEditor({ tenantId }: { tenantId: string }) {
  const router = useRouter()

  async function updateStatus(status: Status) {
    await fetch(`/api/admin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_status: status }),
    })
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmDialog
        title="Set tenant to Active?"
        description="This grants full account access."
        triggerLabel="Set Active"
        confirmLabel="Set Active"
        onConfirm={() => updateStatus('ACTIVE')}
      />
      <ConfirmDialog
        title="Set tenant to Trial?"
        description="This switches the tenant back to trial status."
        triggerLabel="Set Trial"
        confirmLabel="Set Trial"
        onConfirm={() => updateStatus('TRIAL')}
      />
      <ConfirmDialog
        title="Suspend this tenant?"
        description="This blocks account access until reactivated."
        triggerLabel="Suspend"
        triggerVariant="destructive"
        confirmLabel="Suspend"
        onConfirm={() => updateStatus('SUSPENDED')}
      />
    </div>
  )
}
