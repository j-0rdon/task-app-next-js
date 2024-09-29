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

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (error) {
      console.error('Error signing in:', error)
      setErrorMessage('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/reset-password',
      })
      if (error) throw error
      setErrorMessage('Password reset email sent. Please check your inbox.')
    } catch (error) {
      console.error('Error resetting password:', error)
      setErrorMessage('Error sending password reset email. Please try again.')
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
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
              <Alert variant="destructive" className="mt-4">
                <AlertDescription className="text-red-600">{errorMessage}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-gray-800" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/signup" className="text-sm text-primary hover:underline">
            Don't have an account? Sign up
          </Link>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}