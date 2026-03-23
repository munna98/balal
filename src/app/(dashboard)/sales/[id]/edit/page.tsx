'use client'

import { useEffect, useMemo, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImeiScanner } from '@/components/sales/ImeiScanner'
import { SecondPartySelector } from '@/components/sales/SecondPartySelector'
import { useActiveShop, useTenantFromDashboard } from '@/components/layout/active-shop-context'
import type { Customer } from '@/types'

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

export default function EditSalePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const saleId = params.id
  const router = useRouter()
  const tenant = useTenantFromDashboard()
  const activeShop = useActiveShop()

  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)

  // Main customer selector
  const [customerQuery, setCustomerQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // Finance
  const [loanIssueDate, setLoanIssueDate] = useState('')
  const [downPayment, setDownPayment] = useState<string>('0')
  const [loanAmount, setLoanAmount] = useState<string>('')
  const [tenureMonths, setTenureMonths] = useState<string>('12')
  const [emiAmount, setEmiAmount] = useState<string>('')

  // Product
  const [deviceName, setDeviceName] = useState('')
  const [imei, setImei] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')

  // Care Of
  const [careOfOpen, setCareOfOpen] = useState(false)
  const [coName, setCoName] = useState('')
  const [coMobile, setCoMobile] = useState('')

  // Second party
  const [secondPartyEnabled, setSecondPartyEnabled] = useState(false)
  const [secondPartyCustomerId, setSecondPartyCustomerId] = useState<string | null>(null)

  // Notes
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function loadCustomers() {
      try {
        setCustomersLoading(true)
        const res = await fetch('/api/customers')
        const json = await res.json()
        if (!res.ok || !json.data) return
        setAllCustomers(json.data)
      } finally {
        setCustomersLoading(false)
      }
    }
    void loadCustomers()
  }, [])

  useEffect(() => {
    async function loadSale() {
      try {
        const res = await fetch(`/api/sales/${saleId}`)
        const json = await res.json()
        if (res.ok && json.data) {
          const s = json.data
          setSelectedCustomerId(s.customer_id)
          setCustomerQuery(s.customer?.name || '')
          
          if (s.loan_issue_date) {
            const d = new Date(s.loan_issue_date)
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            setLoanIssueDate(`${yyyy}-${mm}-${dd}`)
          }
          
          setDownPayment(s.down_payment?.toString() || '0')
          setLoanAmount(s.loan_amount?.toString() || '0')
          setTenureMonths(s.tenure_months?.toString() || '12')
          setEmiAmount(s.emi_amount?.toString() || '0')
          
          setDeviceName(s.device_name || '')
          setImei(s.imei || '')
          setReferenceNumber(s.reference_number || '')
          
          if (s.co_name || s.co_mobile) {
            setCareOfOpen(true)
            setCoName(s.co_name || '')
            setCoMobile(s.co_mobile || '')
          }
          
          setSecondPartyEnabled(s.is_second_party || false)
          setSecondPartyCustomerId(s.second_party_customer_id || null)
          
          setNotes(s.notes || '')
        } else {
          setError('Failed to load sale details.')
        }
      } catch (e) {
        setError('Error loading sale.')
      } finally {
        setLoadingInitial(false)
      }
    }
    void loadSale()
  }, [saleId])

  const matchingCustomers = useMemo(() => {
    const q = normalizeQuery(customerQuery)
    if (!q) return allCustomers
    return allCustomers.filter((c) => `${c.name} ${c.mobile1}`.toLowerCase().includes(q))
  }, [allCustomers, customerQuery])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!tenant?.id || !activeShop?.id) {
      setError('Tenant/active shop not ready yet.')
      return
    }

    if (!selectedCustomerId) {
      setError('Please select a customer.')
      return
    }

    const downPaymentNum = Number(downPayment)
    const loanAmountNum = Number(loanAmount)
    const tenureNum = Number(tenureMonths)
    const emiAmountNum = Number(emiAmount)

    if (!loanAmountNum || loanAmountNum < 1) {
      setError('Loan amount must be at least 1.')
      return
    }
    if (!emiAmountNum || emiAmountNum < 1) {
      setError('EMI amount must be at least 1.')
      return
    }
    if (!tenureNum || tenureNum < 1 || tenureNum > 24) {
      setError('Tenure must be between 1 and 24 months.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_issue_date: loanIssueDate,
          down_payment: downPaymentNum,
          loan_amount: loanAmountNum,
          tenure_months: tenureNum,
          emi_amount: emiAmountNum,
          device_name: deviceName.trim(),
          imei: imei.trim() || null,
          reference_number: referenceNumber.trim() || null,
          co_name: careOfOpen && coName.trim() ? coName.trim() : null,
          co_mobile: careOfOpen && coMobile.trim() ? coMobile.trim() : null,
          is_second_party: secondPartyEnabled,
          second_party_customer_id: secondPartyEnabled ? secondPartyCustomerId : null,
          notes: notes.trim() ? notes.trim() : null,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to update sale.')
        return
      }

      router.push(`/sales/${saleId}`)
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Error updating sale.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingInitial) return <main className="p-4">Loading...</main>

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Edit Sale</h2>

      <Card>
        <CardHeader>
          <CardTitle>Sale details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Customer selector (readonly for edit usually, but let's keep it search-based or just display) */}
            <section className="space-y-2">
              <Label>Customer (changing customer is restricted via UI, currently disabled)</Label>
              <Input
                placeholder="Search customer by name or mobile"
                value={customerQuery}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Finance */}
              <section className="space-y-4">
                <Card className="p-4" size="sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Finance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-0">
                    <div className="space-y-1.5">
                      <Label htmlFor="loan-issue-date">Loan date</Label>
                      <Input id="loan-issue-date" type="date" value={loanIssueDate} onChange={(e) => setLoanIssueDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="down-payment">Down payment</Label>
                      <Input
                        id="down-payment"
                        type="number"
                        min="0"
                        step="0.01"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="loan-amount">Loan amount</Label>
                      <Input
                        id="loan-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tenure">Tenure (months)</Label>
                      <Input
                        id="tenure"
                        type="number"
                        min="1"
                        max="24"
                        step="1"
                        value={tenureMonths}
                        onChange={(e) => setTenureMonths(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Tenure must be between 1 and 24 months.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="emi-amount">EMI amount</Label>
                      <Input
                        id="emi-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={emiAmount}
                        onChange={(e) => setEmiAmount(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Product */}
              <section className="space-y-4">
                <Card className="p-4" size="sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Product</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-0">
                    <div className="space-y-1.5">
                      <Label htmlFor="device-name">Device name</Label>
                      <Input id="device-name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <ImeiScanner value={imei} onChange={setImei} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reference-number">Reference number</Label>
                      <Input
                        id="reference-number"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Care Of */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Care Of</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setCareOfOpen((v) => !v)}>
                  {careOfOpen ? 'Hide' : 'Add'}
                </Button>
              </div>
              {careOfOpen ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="co-name">CO name</Label>
                    <Input id="co-name" value={coName} onChange={(e) => setCoName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="co-mobile">CO mobile</Label>
                    <Input
                      id="co-mobile"
                      value={coMobile}
                      onChange={(e) => setCoMobile(e.target.value)}
                      inputMode="numeric"
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>
              ) : null}
            </section>

            {/* Second party */}
            <section>
              <SecondPartySelector
                customers={allCustomers}
                selectedCustomerId={secondPartyCustomerId}
                enabled={secondPartyEnabled}
                onEnabledChange={setSecondPartyEnabled}
                onSelect={setSecondPartyCustomerId}
              />
            </section>

            <section className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
            </section>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading || customersLoading || loadingInitial}>
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
