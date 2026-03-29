import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <main className="space-y-4">
      {/* Two filter select skeletons */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-7 w-40 rounded-md" />
      </div>

      {/* Table card with 10 rows */}
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              {/* Customer */}
              <Skeleton className="h-3 flex-[2]" />
              {/* Device */}
              <Skeleton className="h-3 flex-[2]" />
              {/* Date */}
              <Skeleton className="h-3 flex-1" />
              {/* Age */}
              <Skeleton className="h-3 flex-1" />
              {/* Paid */}
              <Skeleton className="h-3 flex-1" />
              {/* Repaid */}
              <Skeleton className="h-3 flex-1" />
              {/* Balance */}
              <Skeleton className="h-3 w-14 shrink-0" />
              {/* Action button */}
              <Skeleton className="h-6 w-24 rounded-md shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
