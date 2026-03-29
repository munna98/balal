'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

type Status = 'ACTIVE' | 'TRIAL' | 'SUSPENDED'

export function TenantStatusEditor({ tenantId }: { tenantId: string }) {
  const router = useRouter()

  async function updateStatus(status: Status) {
    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_status: status }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error((json as { error?: string }).error || 'Failed to update status')
      return
    }
    toast.success('Subscription status updated')
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
