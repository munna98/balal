'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const MOBILE_MEDIA_QUERY = '(max-width: 767px)'

export function ResponsiveSheetDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  bodyClassName,
  drawerContentClassName,
  sheetContentClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  bodyClassName?: string
  drawerContentClassName?: string
  sheetContentClassName?: string
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className={cn('max-h-[92vh]', drawerContentClassName)}>
          <DrawerHeader className="pb-2">
            <DrawerTitle>{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </DrawerHeader>
          <div className={cn('overflow-y-auto px-4 pb-4', bodyClassName)}>{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sheetContentClassName}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className={cn('p-6 pt-0', bodyClassName)}>{children}</div>
      </SheetContent>
    </Sheet>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)

    function updateMatches() {
      setIsMobile(mediaQuery.matches)
    }

    updateMatches()
    mediaQuery.addEventListener('change', updateMatches)

    return () => {
      mediaQuery.removeEventListener('change', updateMatches)
    }
  }, [])

  return isMobile
}
