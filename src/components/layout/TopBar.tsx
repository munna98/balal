"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useActiveShop } from '@/components/layout/active-shop-context'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

function titleFromPath(pathname: string) {
  const last = pathname.split('/').filter(Boolean).pop()
  if (!last) return 'Dashboard'
  return last
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 30)
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const activeShop = useActiveShop()

  const pageTitle = useMemo(() => titleFromPath(pathname), [pathname])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-0.5">
        <h1 className="text-lg font-semibold leading-none">{pageTitle}</h1>
        <p className="text-xs text-muted-foreground">
          {activeShop ? activeShop.name : '-'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleSignOut()}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
