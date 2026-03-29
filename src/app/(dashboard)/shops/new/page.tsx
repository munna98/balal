'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/shared/BackButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTenantFromDashboard } from '@/components/layout/active-shop-context'

export default function NewShopPage() {
  const router = useRouter()
  const tenant = useTenantFromDashboard()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!tenant?.id) {
      setError('Session not ready. Try again.')
      return
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Shop name is required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      })

      const json = (await res.json()) as { data?: { id: string }; error?: string }

      if (!res.ok || !json.data?.id) {
        setError(json.error || 'Failed to create shop.')
        return
      }

      router.push(`/shops/${json.data.id}`)
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/shops" compact />
        <h2 className="text-xl font-semibold">New Shop</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="shop-name">Name</Label>
              <Input
                id="shop-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Street Branch"
                required
                autoComplete="organization"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-address">Address (optional)</Label>
              <Textarea
                id="shop-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, area, city"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-phone">Shop phone (optional)</Label>
              <Input
                id="shop-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="Contact number"
                autoComplete="tel"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create shop'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
