'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BackButton } from '@/components/shared/BackButton'
import { RISK_LEVELS } from '@/lib/constants'
import { useTenantFromDashboard } from '@/components/layout/active-shop-context'

import type { RiskLevelKey } from '@/types'

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)
}

export default function NewCustomerPage() {
  const router = useRouter()
  const tenant = useTenantFromDashboard()

  const [name, setName] = useState('')
  const [mobile1, setMobile1] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [riskLevel, setRiskLevel] = useState<RiskLevelKey>('NEUTRAL')
  
  const [mobile2, setMobile2] = useState('')
  const [mobile2Label, setMobile2Label] = useState('Father')
  const [mobile3, setMobile3] = useState('')
  const [mobile3Label, setMobile3Label] = useState('Mother')
  const [mobile4, setMobile4] = useState('')
  const [mobile4Label, setMobile4Label] = useState('Friend')
  const [showAdditionalMobiles, setShowAdditionalMobiles] = useState(false)

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mobile = useMemo(() => isMobileDevice(), [])
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Deferred photo upload: we only upload after customer is created.
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setPhotoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  // Debounced duplicate check on mobile1 change
  useEffect(() => {
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current)
    }

    const v = mobile1.trim()
    if (v.length !== 10) {
      setDuplicateWarning(null)
      return
    }

    duplicateCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(v)}`)
        const json = (await res.json()) as { data?: { id: string; mobile1: string }[] }
        const hasExact = (json.data || []).some((c) => c.mobile1 === v)
        setDuplicateWarning(hasExact ? 'This mobile number already exists. Please verify.' : null)
      } catch {
        setDuplicateWarning(null)
      }
    }, 300) // 300ms debounce delay

    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current)
      }
    }
  }, [mobile1])

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
      // 1) Create customer
      const createRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          mobile1: trimmedMobile1,
          aadhaar: aadhaar.trim() ? aadhaar.trim() : undefined,
          risk_level: riskLevel,
          mobile2: mobile2.trim() ? mobile2.trim() : undefined,
          mobile2_label: mobile2Label.trim() ? mobile2Label.trim() : undefined,
          mobile3: mobile3.trim() ? mobile3.trim() : undefined,
          mobile3_label: mobile3Label.trim() ? mobile3Label.trim() : undefined,
          mobile4: mobile4.trim() ? mobile4.trim() : undefined,
          mobile4_label: mobile4Label.trim() ? mobile4Label.trim() : undefined,
        }),
      })

      const createJson = (await createRes.json()) as {
        data?: { customer?: { id: string } }
        error?: string
        warning?: string | null
      }

      if (!createRes.ok || !createJson.data?.customer?.id) {
        setError(createJson.error || 'Failed to create customer.')
        return
      }

      const customerId = createJson.data.customer.id

      // 2) Upload photo (if provided) + update customer photo_url
      if (photoFile) {
        const supabase = createClient()
        const path = `${tenant.id}/customers/${customerId}/photo.jpg`
        const { error: uploadError } = await supabase.storage.from('shop-assets').upload(path, photoFile, {
          upsert: true,
          contentType: photoFile.type || 'image/jpeg',
        })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('shop-assets').getPublicUrl(path)
        const photoUrl = data.publicUrl

        const updateRes = await fetch(`/api/customers/${customerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo_url: photoUrl }),
        })
        if (!updateRes.ok) {
          setError('Customer created, but photo upload failed.')
          return
        }
      }

      // 3) Redirect
      router.push(`/customers/${customerId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/customers" compact />
        <h2 className="text-xl font-semibold">New Customer</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-wrap items-start gap-4">
              <div className="space-y-2">
                <Avatar className="size-20">
                  {photoPreviewUrl ? <AvatarImage src={photoPreviewUrl} alt="Customer photo preview" /> : null}
                  <AvatarFallback>Photo</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-2">
                <Label>Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture={mobile ? 'environment' : undefined}
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">You can capture photo on mobile. Upload happens after submit.</p>
              </div>
            </div>

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
                  placeholder="10-digit mobile"
                  required
                />
                {duplicateWarning ? <p className="text-xs text-orange-600">{duplicateWarning}</p> : null}
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
                  placeholder="12-digit aadhaar"
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
                <div className="pt-1 text-xs">
                  <span className={`inline-flex items-center rounded border px-2 py-0.5 ${RISK_LEVELS[riskLevel].color} text-white`}>
                    {RISK_LEVELS[riskLevel].level} · {RISK_LEVELS[riskLevel].label}
                  </span>
                </div>
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

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="Any extra notes for this customer..." />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Customer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
