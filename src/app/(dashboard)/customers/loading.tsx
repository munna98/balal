import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <main className="space-y-4">
      {/* Header row: title left, button right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Search input */}
      <Skeleton className="h-9 w-full rounded-md" />

      {/* Table rows inside a borderless card */}
      <Card className="border-0 shadow-none">
        <CardContent className="space-y-3 p-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-1 py-1.5">
              {/* Avatar circle */}
              <Skeleton className="size-7 rounded-full shrink-0" />
              {/* Name */}
              <Skeleton className="h-3 flex-[1.5]" />
              {/* Mobile */}
              <Skeleton className="h-3 flex-1" />
              {/* Risk badge pill */}
              <Skeleton className="h-4 w-14 rounded-full shrink-0" />
              {/* Sales count */}
              <Skeleton className="h-3 w-5 shrink-0" />
              {/* Balance */}
              <Skeleton className="h-3 w-12 shrink-0" />
              {/* Action dot */}
              <Skeleton className="size-6 rounded-full shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
