'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BackButton({
  href,
  label = 'Back',
  compact = false,
  className,
}: {
  href: string
  label?: string
  compact?: boolean
  className?: string
}) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(href)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        compact ? 'h-9 w-9 rounded-md p-0' : 'w-fit pl-0',
        className
      )}
      onClick={handleBack}
      aria-label={label}
    >
      <ArrowLeft className="size-4" />
      {compact ? <span className="sr-only">{label}</span> : label}
    </Button>
  )
}
