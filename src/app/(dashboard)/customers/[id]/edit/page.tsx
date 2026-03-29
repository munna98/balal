'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BackButton } from '@/components/shared/BackButton'
import { RISK_LEVELS } from '@/lib/constants'
import { useTenantFromDashboard } from '@/components/layout/active-shop-context'
import { CustomerPhotoPicker } from '@/components/customers/CustomerPhotoPicker'
import type { RiskLevelKey } from '@/types'

export default function EditCustomerPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const customerId = params.id
  const router = useRouter()
  const tenant = useTenantFromDashboard()

  const [loadingInitial, setLoadingInitial] = useState(true)
  const [name, setName] = useState('')
  const [mobile1, setMobile1] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [riskLevel, setRiskLevel] = useState<RiskLevelKey>('NEUTRAL')
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)

  const [mobile2, setMobile2] = useState('')
  const [mobile2Label, setMobile2Label] = useState('Father')
  const [mobile3, setMobile3] = useState('')
  const [mobile3Label, setMobile3Label] = useState('Mother')
  const [mobile4, setMobile4] = useState('')
  const [mobile4Label, setMobile4Label] = useState('Friend')
  const [showAdditionalMobiles, setShowAdditionalMobiles] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/customers/${customerId}`)
        const json = await res.json()
        if (res.ok && json.data?.customer) {
          const c = json.data.customer
          setName(c.name || '')
          setMobile1(c.mobile1 || '')
          setAadhaar(c.aadhaar || '')
          setRiskLevel((c.risk_level as RiskLevelKey) || 'NEUTRAL')
          setExistingPhotoUrl(c.photo_url || null)

          setMobile2(c.mobile2 || '')
          setMobile2Label(c.mobile2_label || 'Father')
          setMobile3(c.mobile3 || '')
          setMobile3Label(c.mobile3_label || 'Mother')
          setMobile4(c.mobile4 || '')
          setMobile4Label(c.mobile4_label || 'Friend')
          if (c.mobile2 || c.mobile3 || c.mobile4) {
            setShowAdditionalMobiles(true)
          }
        } else {
          setError('Failed to load customer details.')
        }
      } catch {
        setError('Error loading customer.')
      } finally {
        setLoadingInitial(false)
      }
    }
    void load()
  }, [customerId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!tenant?.id) {
      setError('Tenant not available.')
      return
    }

    const trimmedName = name.trim()
    const trimmedMobile1 = mobile1.trim()
    if (!trimmedName || !trimmedMobile1) {
      setError('Name and mobile are required.')
      return
    }

    setSubmitting(true)
    try {
      let finalPhotoUrl = existingPhotoUrl

      if (photoFile) {
        const supabase = createClient()
        const path = `${tenant.id}/customers/${customerId}/photo.jpg`
        const { error: uploadError } = await supabase.storage.from('shop-assets').upload(path, photoFile, {
          upsert: true,
          contentType: photoFile.type || 'image/jpeg',
        })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('shop-assets').getPublicUrl(path)
        finalPhotoUrl = data.publicUrl
      }

      const updateRes = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          mobile1: trimmedMobile1,
          aadhaar: aadhaar.trim() ? aadhaar.trim() : undefined,
          risk_level: riskLevel,
          photo_url: finalPhotoUrl,
          mobile2: mobile2.trim() ? mobile2.trim() : undefined,
          mobile2_label: mobile2Label.trim() ? mobile2Label.trim() : undefined,
          mobile3: mobile3.trim() ? mobile3.trim() : undefined,
          mobile3_label: mobile3Label.trim() ? mobile3Label.trim() : undefined,
          mobile4: mobile4.trim() ? mobile4.trim() : undefined,
          mobile4_label: mobile4Label.trim() ? mobile4Label.trim() : undefined,
        }),
      })

      const updateJson = await updateRes.json()
      if (!updateRes.ok) {
        setError(updateJson.error || 'Failed to update customer.')
        return
      }

      router.push(`/customers/${customerId}`)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error saving customer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInitial) return <main className="p-4">Loading...</main>

  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href={`/customers/${customerId}`} compact label="Back to customer" />
        <h2 className="text-xl font-semibold">Edit Customer</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <CustomerPhotoPicker
              label="Update photo"
              initialUrl={existingPhotoUrl}
              fallbackLabel={name || 'Photo'}
              onChange={setPhotoFile}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer-name">Name</Label>
                <Input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-mobile1">Mobile</Label>
                <Input
                  id="customer-mobile1"
                  value={mobile1}
                  onChange={(e) => setMobile1(e.target.value)}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer-aadhaar">Aadhaar (optional)</Label>
                <Input
                  id="customer-aadhaar"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Risk level</Label>
                <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevelKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RISK_LEVELS) as RiskLevelKey[]).map((key) => {
                      const r = RISK_LEVELS[key]
                      return (
                        <SelectItem key={key} value={key}>
                          <span className={`inline-flex items-center gap-2`}>
                            <span className={`size-2 rounded-full ${r.color.replace('bg-', 'bg-')}`} />
                            {r.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 border p-3 rounded-md bg-muted/20">
              <div className="flex items-center justify-between pb-2 border-b">
                <Label className="text-base font-medium">Additional Mobile Numbers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdditionalMobiles(!showAdditionalMobiles)}
                >
                  {showAdditionalMobiles ? 'Hide' : 'Add'} Numbers
                </Button>
              </div>
              
              {showAdditionalMobiles && (
                <div className="grid gap-4 sm:grid-cols-2 pt-3">
                  <div className="space-y-1.5">
                    <Label>Mobile 2 (Optional)</Label>
                    <div className="flex gap-2">
                      <Select value={mobile2Label} onValueChange={setMobile2Label}>
                        <SelectTrigger className="w-[110px] shrink-0">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={mobile2}
                        onChange={(e) => setMobile2(e.target.value)}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Mobile 3 (Optional)</Label>
                    <div className="flex gap-2">
                      <Select value={mobile3Label} onValueChange={setMobile3Label}>
                        <SelectTrigger className="w-[110px] shrink-0">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={mobile3}
                        onChange={(e) => setMobile3(e.target.value)}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Mobile 4 (Optional)</Label>
                    <div className="flex gap-2 sm:w-[calc(50%-0.5rem)]">
                      <Select value={mobile4Label} onValueChange={setMobile4Label}>
                        <SelectTrigger className="w-[110px] shrink-0">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={mobile4}
                        onChange={(e) => setMobile4(e.target.value)}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
