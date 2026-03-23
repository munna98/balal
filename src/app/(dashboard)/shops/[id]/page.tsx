import { BackButton } from '@/components/shared/BackButton'

export default function ShopDetailPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/shops" compact label="Back to shops" />
        <h2 className="text-xl font-semibold">Shop Detail</h2>
      </div>
    </main>
  )
}
