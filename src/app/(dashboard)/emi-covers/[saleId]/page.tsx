import { BackButton } from '@/components/shared/BackButton'

export default function SaleEmiCoversPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/emi-covers" compact />
        <h2 className="text-xl font-semibold">Sale EmiCovers</h2>
      </div>
    </main>
  )
}
