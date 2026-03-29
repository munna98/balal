import { BackButton } from '@/components/shared/BackButton'

export default function SalePaymentsPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/payments" compact />
        <h2 className="text-xl font-semibold">Sale Payments</h2>
      </div>
    </main>
  )
}
