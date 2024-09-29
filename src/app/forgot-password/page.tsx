'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"

const COOLDOWN_TIME = 15000 // 15 seconds in milliseconds

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => Math.max(0, prev - 100))
      }, 100)
    }
    return () => clearInterval(timer)
  }, [cooldownRemaining])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setCooldownRemaining(COOLDOWN_TIME)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      setMessage('Password reset email sent. Check your inbox.')
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const buttonStyle = {
    background: `linear-gradient(to right, #000 ${(COOLDOWN_TIME - cooldownRemaining) / COOLDOWN_TIME * 100}%, #666 ${(COOLDOWN_TIME - cooldownRemaining) / COOLDOWN_TIME * 100}%)`,
    transition: 'background 0.1s linear'
  }

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || cooldownRemaining > 0}
              className="w-full text-white"
              style={buttonStyle}
            >
              {isLoading || cooldownRemaining > 0 ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` : 'Send Reset Link'}
            </Button>
          </form>
          {message && (
            <Alert variant={message.includes('Error') ? "destructive" : "default"} className="mt-4">
              <AlertDescription className={message.includes('Error') ? "text-red-600" : "text-green-600"}>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Link href="/signin" className="text-sm text-primary hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}