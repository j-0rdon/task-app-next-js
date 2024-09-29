'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidResetLink, setIsValidResetLink] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkResetToken = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        setIsValidResetLink(false)
        setMessage('Invalid or expired reset link. Please try again.')
      } else {
        setIsValidResetLink(true)
      }
    }
    checkResetToken()
  }, [])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage('Password updated successfully')
      setTimeout(() => router.push('/signin'), 2000)
    } catch (error: any) {
      setMessage(`Error updating password: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidResetLink) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <Card className="w-full max-w-md bg-white">
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/forgot-password')} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
          {message && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription className="text-red-600">{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="link" 
            onClick={() => router.push('/signin')}
            className="text-sm text-primary hover:underline"
          >
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}