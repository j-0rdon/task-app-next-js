'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"

const COOLDOWN_TIME = 60000 // 1 minute in milliseconds

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastAttempt, setLastAttempt] = useState(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, COOLDOWN_TIME - (Date.now() - lastAttempt))
      setCooldownRemaining(remaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [lastAttempt])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Date.now() - lastAttempt < COOLDOWN_TIME) {
      setErrorMessage(`Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before trying again.`)
      return
    }
    setIsLoading(true)
    setErrorMessage('')
    setLastAttempt(Date.now())
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
      if (data.user) {
        router.push('/signup-success')
      }
    } catch (error: any) {
      console.error('Error signing up:', error)
      if (error.message.includes('rate limit')) {
        setErrorMessage('Too many signup attempts. Please try again later.')
      } else {
        setErrorMessage(error.message || 'Error signing up. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || cooldownRemaining > 0}>
              {isLoading ? 'Signing Up...' : cooldownRemaining > 0 ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link href="/signin" className="text-sm text-primary hover:underline">
            Already have an account? Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}