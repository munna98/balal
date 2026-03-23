import Link from 'next/link'
import { notFound } from 'next/navigation'
import { APP_NAME, SUPPORT_WHATSAPP } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function getDaysAgo(date: Date) {
  const nowMs = new Date().getTime()
  const diffMs = nowMs - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const tenant = await prisma.tenant.findUnique({
    where: { supabase_user_id: user.id },
    select: {
      subscription_status: true,
      trial_ends_at: true,
    },
  })

  if (!tenant) {
    notFound()
  }

  const isSuspended = tenant.subscription_status === 'SUSPENDED'
  const nowMs = new Date().getTime()
  const hasTrialEnded = Boolean(tenant.trial_ends_at && tenant.trial_ends_at.getTime() < nowMs)
  const daysAgo = tenant.trial_ends_at ? getDaysAgo(tenant.trial_ends_at) : 0

  const heading = isSuspended ? 'Your account is suspended' : 'Your trial has ended'
  const description = isSuspended
    ? 'Please contact us to reactivate your Balal Finance account.'
    : `Your trial ended ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago.`

  if (!isSuspended && !hasTrialEnded) {
    notFound()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm font-semibold tracking-wide text-primary">{APP_NAME}</p>
          <CardTitle className="text-2xl">{heading}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href={SUPPORT_WHATSAPP} target="_blank" rel="noreferrer">
              Contact us to activate your account
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="mailto:hello@balal.in">Email hello@balal.in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
