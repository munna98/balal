import { BackButton } from '@/components/shared/BackButton'

export default function SaleAdvancesPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/advances" compact />
        <h2 className="text-xl font-semibold">Sale Advances</h2>
      </div>
    </main>
  )
}
