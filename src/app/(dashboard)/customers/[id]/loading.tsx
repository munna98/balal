import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <main className="space-y-6">
      {/* Back button + title row */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-6 w-36" />
      </div>

      {/* Customer header: avatar + info left, balance + edit right */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          {/* Large avatar */}
          <Skeleton className="size-16 rounded-full shrink-0" />
          <div className="space-y-2">
            {/* Name */}
            <Skeleton className="h-5 w-48" />
            {/* Two mobile fields */}
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>

        {/* Balance + edit button — right-aligned on desktop */}
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* Sales card */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-3 w-10" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="flex flex-col h-full bg-muted/30">
                <div className="flex-1 p-4 space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="p-4 pt-0">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded-md" />
                    <Skeleton className="h-8 flex-1 rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
