'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const supabase = createClient()
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          owner_name: ownerName,
        },
      },
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setSubmitted(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm font-semibold tracking-wide text-primary">{APP_NAME}</p>
          <CardTitle className="text-2xl">Start your free 14-day trial</CardTitle>
          <CardDescription>No credit card required.</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <p className="rounded-md border bg-muted p-3 text-sm">
                Check your email to confirm your account.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Already confirmed?{' '}
                <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner name</Label>
                <Input
                  id="ownerName"
                  required
                  placeholder="Your name"
                  value={ownerName}
                  onChange={(event) => setOwnerName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
