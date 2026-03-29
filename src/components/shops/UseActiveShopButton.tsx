'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const ACTIVE_SHOP_COOKIE = 'balal_active_shop'

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=2592000; samesite=lax`
}

export function UseActiveShopButton({
  shopId,
  isCurrentWorkspace,
}: {
  shopId: string
  isCurrentWorkspace: boolean
}) {
  const router = useRouter()

  if (isCurrentWorkspace) {
    return (
      <Button type="button" variant="secondary" size="sm" disabled className="w-full sm:w-auto">
        Current workspace
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full sm:w-auto"
      onClick={() => {
        writeCookie(ACTIVE_SHOP_COOKIE, shopId)
        router.refresh()
      }}
    >
      Use this shop
    </Button>
  )
}
