"use client"

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useActiveShop } from '@/components/layout/active-shop-context'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

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
  const activeShop = useActiveShop()

  const pageTitle = useMemo(() => titleFromPath(pathname), [pathname])

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-0.5">
        <h1 className="text-lg font-semibold leading-none">{pageTitle}</h1>
        <p className="text-xs text-muted-foreground">
          {activeShop ? activeShop.name : '-'}
        </p>
      </div>
      <ThemeToggle />
    </div>
  )
}
