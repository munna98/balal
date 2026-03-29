import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Toaster } from '@/components/ui/sonner'
import { Skeleton } from '@/components/ui/skeleton'

function AdminLoadingFallback() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-52" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader />
      <div className="mx-auto w-full max-w-7xl flex-1">
        <Suspense fallback={<AdminLoadingFallback />}>
          {children}
        </Suspense>
      </div>
      <Toaster />
    </div>
  )
}
