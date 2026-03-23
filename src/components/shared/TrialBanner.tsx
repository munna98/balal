'use client'

import { useMemo, useState } from 'react'
import { SUPPORT_WHATSAPP } from '@/lib/constants'
import { Button } from '@/components/ui/button'

const DISMISS_KEY = 'trial-banner-dismissed'

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  })

  const isUrgent = daysLeft <= 3
  const title = useMemo(() => {
    if (daysLeft <= 0) return 'Your trial ends today'
    return `Your trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
  }, [daysLeft])

  if (dismissed) return null

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
        isUrgent ? 'border-red-300 bg-red-50 text-red-700' : 'border-yellow-300 bg-yellow-50 text-yellow-800'
      }`}
    >
      <p className="text-sm font-medium">{title}</p>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant={isUrgent ? 'destructive' : 'default'}>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noreferrer">
            Activate now
          </a>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, '1')
            setDismissed(true)
          }}
        >
          Dismiss
        </Button>
      </div>
    </div>
  )
}
