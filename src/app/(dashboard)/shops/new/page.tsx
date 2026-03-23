import { BackButton } from '@/components/shared/BackButton'

export default function NewShopPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/shops" compact />
        <h2 className="text-xl font-semibold">New Shop</h2>
      </div>
    </main>
  )
}
