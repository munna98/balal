'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Plan = 'BASIC' | 'PREMIUM'

export function TenantPlanShopLimitEditor({
  tenantId,
  plan,
  shopLimit,
}: {
  tenantId: string
  plan: Plan
  shopLimit: number
}) {
  const router = useRouter()

  async function savePlan(next: Plan) {
    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: next }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error((json as { error?: string }).error || 'Failed to update plan')
      return
    }
    toast.success('Plan updated')
    router.refresh()
  }

  async function saveShopLimit(formData: FormData) {
    const raw = String(formData.get('shop_limit') ?? '')
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n) || n < 1) {
      toast.error('Shop limit must be at least 1')
      return
    }
    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_limit: n }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error((json as { error?: string }).error || 'Failed to update shop limit')
      return
    }
    toast.success('Shop limit updated')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan &amp; limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="admin-plan">Plan</Label>
          <Select value={plan} onValueChange={(v) => void savePlan(v as Plan)}>
            <SelectTrigger id="admin-plan" className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BASIC">Basic</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form action={saveShopLimit} className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="shop_limit">Max shops</Label>
            <Input
              key={shopLimit}
              id="shop_limit"
              name="shop_limit"
              type="number"
              min={1}
              step={1}
              defaultValue={shopLimit}
              className="w-32"
            />
          </div>
          <Button type="submit">Save limit</Button>
        </form>
      </CardContent>
    </Card>
  )
}
