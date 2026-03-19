'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { APP_NAME } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleComplete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const response = await fetch('/api/tenants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ownerName,
        phone,
        shopName,
        shopAddress,
        shopPhone,
      }),
    })

    setIsLoading(false)

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setErrorMessage(data?.error || 'Unable to complete onboarding')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2">
          <p className="text-center text-sm font-semibold tracking-wide text-primary">{APP_NAME}</p>
          <CardTitle className="text-center text-2xl">Welcome to Balal Finance</CardTitle>
          <CardDescription className="text-center">
            Complete onboarding to start managing your shop.
          </CardDescription>
          <div className="pt-2 text-center text-sm text-muted-foreground">
            Step {step} of 2
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className={`h-full bg-primary transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleComplete} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">What&apos;s your name?</Label>
                  <Input
                    id="ownerName"
                    required
                    value={ownerName}
                    onChange={(event) => setOwnerName(event.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Your WhatsApp number</Label>
                  <Input
                    id="phone"
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="10-digit number"
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={!ownerName.trim() || !phone.trim()}
                >
                  Continue to Step 2
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shopName">Name your first shop</Label>
                  <Input
                    id="shopName"
                    required
                    value={shopName}
                    onChange={(event) => setShopName(event.target.value)}
                    placeholder="Shop name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Shop address (optional)</Label>
                  <Input
                    id="shopAddress"
                    value={shopAddress}
                    onChange={(event) => setShopAddress(event.target.value)}
                    placeholder="Address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopPhone">Shop phone (optional)</Label>
                  <Input
                    id="shopPhone"
                    value={shopPhone}
                    onChange={(event) => setShopPhone(event.target.value)}
                    placeholder="Shop phone number"
                  />
                </div>
                {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading || !shopName.trim()}>
                    {isLoading ? 'Completing...' : 'Complete setup'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
