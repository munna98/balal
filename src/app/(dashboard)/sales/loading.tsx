import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <main className="space-y-4">
      {/* Filter row: two small buttons left, one right + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <Skeleton className="h-8 w-80 rounded-md" />
      </div>

      {/* Table card with 10 rows */}
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              {/* Customer: two-line cell (name + mobile subtitle) */}
              <div className="flex flex-[2] flex-col gap-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-3/4" />
              </div>
              {/* Device */}
              <Skeleton className="h-3 flex-[2]" />
              {/* IMEI */}
              <Skeleton className="h-3 flex-1" />
              {/* Loan */}
              <Skeleton className="h-3 flex-1" />
              {/* EMI */}
              <Skeleton className="h-3 flex-1" />
              {/* Tenure */}
              <Skeleton className="h-3 flex-1" />
              {/* Date */}
              <Skeleton className="h-3 flex-1" />
              {/* Balance */}
              <Skeleton className="h-3 w-14 shrink-0" />
              {/* Action dot */}
              <Skeleton className="size-6 rounded-full shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
