import type { ReactNode } from 'react'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { TenantProvider } from '@/components/layout/tenant-context'
import { TrialBanner } from '@/components/shared/TrialBanner'
import type { Tenant } from '@/types'

function calculateTrialDaysLeft(trialEndsAt: Date | null) {
  if (!trialEndsAt) return 0
  const diffMs = trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let tenant: Tenant | null = null

  if (user) {
    tenant = await prisma.tenant.findUnique({
      where: { supabase_user_id: user.id },
    })
  }

  const daysLeft = tenant ? calculateTrialDaysLeft(tenant.trial_ends_at) : 0
  const showTrialBanner = tenant?.subscription_status === 'TRIAL'

  return (
    <TenantProvider tenant={tenant}>
      <div className="mx-auto w-full max-w-7xl px-4 py-4">
        {showTrialBanner ? <TrialBanner daysLeft={daysLeft} /> : null}
        {children}
      </div>
    </TenantProvider>
  )
}
