'use client'

import { useState } from 'react'
import type { Customer, RiskLevelKey } from '@/types'
import { RISK_LEVELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CustomerPhotoPicker } from '@/components/customers/CustomerPhotoPicker'
import { formatAadhaarInput, normalizeAadhaarInput } from '@/lib/aadhaar'

export type CustomerFormSubmit = {
  name: string
  mobile1: string
  aadhaar?: string
  risk_level: RiskLevelKey
  mobile2?: string
  mobile2_label?: string
  mobile3?: string
  mobile3_label?: string
  mobile4?: string
  mobile4_label?: string
  photoFile?: File | null
  notes?: string
}

const MOBILE_LABEL_OPTIONS = ['Father', 'Mother', 'Friend', 'Spouse', 'Other'] as const

export function CustomerForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save customer',
}: {
  defaultValues?: Partial<Customer>
  onSubmit: (values: CustomerFormSubmit) => Promise<void> | void
  submitLabel?: string
}) {
  const [name, setName] = useState(defaultValues?.name || '')
  const [mobile1, setMobile1] = useState(defaultValues?.mobile1 || '')
  const [aadhaar, setAadhaar] = useState(normalizeAadhaarInput(defaultValues?.aadhaar || ''))
  const [riskLevel, setRiskLevel] = useState<RiskLevelKey>((defaultValues?.risk_level as RiskLevelKey | undefined) || 'NEUTRAL')
  const [mobile2, setMobile2] = useState(defaultValues?.mobile2 || '')
  const [mobile2Label, setMobile2Label] = useState(defaultValues?.mobile2_label || 'Father')
  const [mobile3, setMobile3] = useState(defaultValues?.mobile3 || '')
  const [mobile3Label, setMobile3Label] = useState(defaultValues?.mobile3_label || 'Mother')
  const [mobile4, setMobile4] = useState(defaultValues?.mobile4 || '')
  const [mobile4Label, setMobile4Label] = useState(defaultValues?.mobile4_label || 'Friend')
  const [showAdditionalMobiles, setShowAdditionalMobiles] = useState(
    Boolean(defaultValues?.mobile2 || defaultValues?.mobile3 || defaultValues?.mobile4)
  )
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  async function checkDuplicateOnBlur(value: string) {
    const v = value.trim()
    if (v.length !== 10) {
      setDuplicateWarning(null)
      return
    }

    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(v)}`)
      const json = (await res.json()) as { data?: { id: string; mobile1: string }[] }
      const hasExact = (json.data || []).some((customer) => customer.mobile1 === v)
      setDuplicateWarning(hasExact ? 'This mobile number already exists. Please verify.' : null)
    } catch {
      setDuplicateWarning(null)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        name,
        mobile1,
        aadhaar: aadhaar || undefined,
        risk_level: riskLevel,
        mobile2: mobile2 || undefined,
        mobile2_label: mobile2Label || undefined,
        mobile3: mobile3 || undefined,
        mobile3_label: mobile3Label || undefined,
        mobile4: mobile4 || undefined,
        mobile4_label: mobile4Label || undefined,
        photoFile,
        notes: notes || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <CustomerPhotoPicker
        initialUrl={defaultValues?.photo_url || null}
        fallbackLabel={name || defaultValues?.name || 'Photo'}
        onChange={setPhotoFile}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customer-name">Name</Label>
          <Input id="customer-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customer-mobile1">Mobile</Label>
          <Input
            id="customer-mobile1"
            value={mobile1}
            onChange={(event) => setMobile1(event.target.value)}
            onBlur={() => void checkDuplicateOnBlur(mobile1)}
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
            value={formatAadhaarInput(aadhaar)}
            onChange={(event) => setAadhaar(normalizeAadhaarInput(event.target.value))}
            inputMode="numeric"
            maxLength={14}
            placeholder="1234-5678-9012"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Risk level</Label>
          <Select value={riskLevel} onValueChange={(value) => setRiskLevel(value as RiskLevelKey)}>
            <SelectTrigger>
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RISK_LEVELS) as RiskLevelKey[]).map((key) => {
                const risk = RISK_LEVELS[key]
                return (
                  <SelectItem key={key} value={key}>
                    <span className="inline-flex items-center gap-2">
                      <span className={`size-2 rounded-full ${risk.color}`} />
                      {risk.label}
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

      <div className="space-y-1.5 rounded-md border bg-muted/20 p-3">
        <div className="flex items-center justify-between border-b pb-2">
          <Label className="text-base font-medium">Additional Mobile Numbers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdditionalMobiles((prev) => !prev)}
          >
            {showAdditionalMobiles ? 'Hide' : 'Add'} Numbers
          </Button>
        </div>

        {showAdditionalMobiles ? (
          <div className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label>Mobile 2 (Optional)</Label>
              <div className="flex gap-2">
                <Select value={mobile2Label} onValueChange={setMobile2Label}>
                  <SelectTrigger className="w-[110px] shrink-0">
                    <SelectValue placeholder="Label" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_LABEL_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={mobile2}
                  onChange={(event) => setMobile2(event.target.value)}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  className="min-w-0 flex-1"
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
                    {MOBILE_LABEL_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={mobile3}
                  onChange={(event) => setMobile3(event.target.value)}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  className="min-w-0 flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Mobile 4 (Optional)</Label>
              <div className="flex gap-2">
                <Select value={mobile4Label} onValueChange={setMobile4Label}>
                  <SelectTrigger className="w-[110px] shrink-0">
                    <SelectValue placeholder="Label" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_LABEL_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={mobile4}
                  onChange={(event) => setMobile4(event.target.value)}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  className="min-w-0 flex-1"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customer-notes">Notes (optional)</Label>
        <Textarea
          id="customer-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Any extra notes for this customer..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
