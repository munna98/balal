'use client'

import { useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ShopItem = {
  id: string
  name: string
}

const ACTIVE_SHOP_COOKIE = 'balal_active_shop'

function readCookie(name: string) {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : ''
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=2592000; samesite=lax`
}

export function ShopSwitcher({ shops }: { shops: ShopItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const defaultValue = useMemo(() => {
    const fromCookie = readCookie(ACTIVE_SHOP_COOKIE)
    if (fromCookie && shops.some((shop) => shop.id === fromCookie)) return fromCookie
    return shops[0]?.id || ''
  }, [shops])

  if (!shops.length) return null

  return (
    <Select
      defaultValue={defaultValue}
      disabled={isPending}
      onValueChange={(value) => {
        writeCookie(ACTIVE_SHOP_COOKIE, value)
        startTransition(() => {
          router.refresh()
        })
      }}
    >
      <SelectTrigger className="w-full opacity-75">
        <SelectValue placeholder="Select shop" />
      </SelectTrigger>
      <SelectContent>
        {shops.map((shop) => (
          <SelectItem key={shop.id} value={shop.id}>
            {shop.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
