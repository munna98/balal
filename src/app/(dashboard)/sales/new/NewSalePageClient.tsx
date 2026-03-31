'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CustomerForm, type CustomerFormSubmit } from '@/components/customers/CustomerForm'
import { ImeiScanner } from '@/components/sales/ImeiScanner'
import { SecondPartySelector } from '@/components/sales/SecondPartySelector'
import { useActiveShop, useTenantFromDashboard } from '@/components/layout/active-shop-context'
import { BackButton } from '@/components/shared/BackButton'
import { CustomerLookupField, type CustomerLookupItem } from '@/components/customers/CustomerLookupField'
import { ResponsiveSheetDrawer } from '@/components/shared/ResponsiveSheetDrawer'

export default function NewSalePageClient({ customers }: { customers: CustomerLookupItem[] }) {
  const router = useRouter()
  const tenant = useTenantFromDashboard()
  const activeShop = useActiveShop()

  const [lookupCustomers, setLookupCustomers] = useState(customers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLookupItem | null>(null)
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false)

  const [loanIssueDate, setLoanIssueDate] = useState(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })
  const [downPayment, setDownPayment] = useState<string>('0')
  const [loanAmount, setLoanAmount] = useState<string>('')
  const [tenureMonths, setTenureMonths] = useState<string>('12')
  const [emiAmount, setEmiAmount] = useState<string>('')

  const [deviceName, setDeviceName] = useState('')
  const [deviceAmount, setDeviceAmount] = useState<string>('')
  const [accessoriesAmount, setAccessoriesAmount] = useState<string>('0')
  const [imei, setImei] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')

  const [careOfOpen, setCareOfOpen] = useState(false)
  const [coName, setCoName] = useState('')
  const [coMobile, setCoMobile] = useState('')

  const [secondPartyEnabled, setSecondPartyEnabled] = useState(false)
  const [secondPartyCustomer, setSecondPartyCustomer] = useState<CustomerLookupItem | null>(null)

  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (selectedCustomer && secondPartyCustomer?.id === selectedCustomer.id) {
      setSecondPartyCustomer(null)
    }
  }, [secondPartyCustomer, selectedCustomer])

  function rememberCustomer(customer: CustomerLookupItem) {
    setLookupCustomers((prev) => (prev.some((item) => item.id === customer.id) ? prev : [customer, ...prev]))
  }

  async function createCustomer(values: CustomerFormSubmit) {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name.trim(),
        mobile1: values.mobile1.trim(),
        aadhaar: values.aadhaar?.trim() || undefined,
        risk_level: values.risk_level,
        mobile2: values.mobile2?.trim() || undefined,
        mobile2_label: values.mobile2_label?.trim() || undefined,
        mobile3: values.mobile3?.trim() || undefined,
        mobile3_label: values.mobile3_label?.trim() || undefined,
        mobile4: values.mobile4?.trim() || undefined,
        mobile4_label: values.mobile4_label?.trim() || undefined,
      }),
    })
    const json = (await response.json()) as {
      data?: {
        customer?: CustomerLookupItem
      }
    }

    if (!response.ok || !json.data?.customer) return

    let customer = json.data.customer

    if (values.photoFile && tenant?.id) {
      const supabase = createClient()
      const path = `${tenant.id}/customers/${customer.id}/photo.jpg`
      const { error: uploadError } = await supabase.storage.from('shop-assets').upload(path, values.photoFile, {
        upsert: true,
        contentType: values.photoFile.type || 'image/jpeg',
      })

      if (!uploadError) {
        const { data } = supabase.storage.from('shop-assets').getPublicUrl(path)
        const photoUrl = data.publicUrl
        const updateRes = await fetch(`/api/customers/${customer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo_url: photoUrl }),
        })

        if (updateRes.ok) {
          customer = { ...customer, photo_url: photoUrl }
        }
      }
    }

    rememberCustomer(customer)
    setSelectedCustomer(customer)
    setCustomerSheetOpen(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!tenant?.id || !activeShop?.id) {
      setError('Tenant/active shop not ready yet.')
      return
    }

    if (!selectedCustomer) {
      setError('Please select a customer.')
      return
    }

    const downPaymentNum = Number(downPayment)
    const loanAmountNum = Number(loanAmount)
    const tenureNum = Number(tenureMonths)
    const emiAmountNum = Number(emiAmount)
    const deviceAmountNum = Number(deviceAmount)
    const accessoriesAmountNum = Number(accessoriesAmount)

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
    if (Number.isNaN(deviceAmountNum) || deviceAmountNum < 0) {
      setError('Device amount must be 0 or more.')
      return
    }
    if (Number.isNaN(accessoriesAmountNum) || accessoriesAmountNum < 0) {
      setError('Accessories amount must be 0 or more.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: activeShop.id,
          customer_id: selectedCustomer.id,
          loan_issue_date: loanIssueDate,
          down_payment: downPaymentNum,
          loan_amount: loanAmountNum,
          tenure_months: tenureNum,
          emi_amount: emiAmountNum,
          device_name: deviceName.trim(),
          device_amount: deviceAmountNum,
          accessories_amount: accessoriesAmountNum,
          imei: imei.trim() || null,
          reference_number: referenceNumber.trim() || null,
          co_name: careOfOpen && coName.trim() ? coName.trim() : null,
          co_mobile: careOfOpen && coMobile.trim() ? coMobile.trim() : null,
          is_second_party: secondPartyEnabled,
          second_party_customer_id: secondPartyEnabled ? secondPartyCustomer?.id ?? null : null,
          notes: notes.trim() ? notes.trim() : null,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.data?.id) {
        setError(json.error || 'Failed to create sale.')
        return
      }

      router.push(`/sales/${json.data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/sales" compact />
        <h2 className="text-xl font-semibold">New Sale</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sale details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className="space-y-2">
              <CustomerLookupField
                label="Customer"
                selectedCustomer={selectedCustomer}
                onSelect={setSelectedCustomer}
                customers={lookupCustomers}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="sm:w-auto sm:px-3"
                    onClick={() => setCustomerSheetOpen(true)}
                  >
                    <Plus className="size-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Create new customer</span>
                  </Button>
                }
              />
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
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
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="device-amount">Device amount</Label>
                        <Input
                          id="device-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={deviceAmount}
                          onChange={(e) => setDeviceAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="accessories-amount">Accessories amount</Label>
                        <Input
                          id="accessories-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={accessoriesAmount}
                          onChange={(e) => setAccessoriesAmount(e.target.value)}
                          required
                        />
                      </div>
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

            <section>
              <SecondPartySelector
                selectedCustomer={secondPartyCustomer}
                excludedCustomerIds={selectedCustomer ? [selectedCustomer.id] : []}
                enabled={secondPartyEnabled}
                onEnabledChange={setSecondPartyEnabled}
                onSelect={setSecondPartyCustomer}
                customers={lookupCustomers}
                onCustomerCreated={rememberCustomer}
              />
            </section>

            <section className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
            </section>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Create Sale'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ResponsiveSheetDrawer
        open={customerSheetOpen}
        onOpenChange={setCustomerSheetOpen}
        title="Create new customer"
        description="Customer will be auto-selected after creation."
      >
        <CustomerForm onSubmit={createCustomer} submitLabel="Create and select customer" />
      </ResponsiveSheetDrawer>
    </main>
  )
}
