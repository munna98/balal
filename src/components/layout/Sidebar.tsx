'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { APP_NAME } from '@/lib/constants'
import { ShopSwitcher } from '@/components/layout/ShopSwitcher'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  HandCoins, 
  Store 
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Sales', href: '/sales', icon: ShoppingCart },
  { label: 'Advances', href: '/advances', icon: HandCoins },
  { label: 'Shops', href: '/shops', icon: Store },
]

type ShopItem = {
  id: string
  name: string
}

export function Sidebar({ shops = [] }: { shops?: ShopItem[] }) {
  const pathname = usePathname()

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 border-r bg-background p-4 md:flex md:flex-col md:gap-4">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{APP_NAME}</h2>
          <ShopSwitcher shops={shops} />
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background px-2 py-1 md:hidden">
        <div className="flex items-center justify-between gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-center text-[10px] ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
