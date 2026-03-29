import type { ReactNode } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Toaster } from '@/components/ui/sonner'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader />
      <div className="mx-auto w-full max-w-7xl flex-1">{children}</div>
      <Toaster />
    </div>
  )
}
