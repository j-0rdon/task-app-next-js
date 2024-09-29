'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [website, setWebsite] = useState<string>('')
  const [password, setPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`full_name, website, avatar_url`)
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setFullName(data.full_name || '')
          setWebsite(data.website || '')
          setAvatarUrl(data.avatar_url || '')
        }

        setEmail(user.email || '')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  async function updateProfile() {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const updates = {
          id: user.id,
          full_name: fullName,
          website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('profiles').upsert(updates)
        if (error) throw error

        if (email && email !== user.email) {
          const { error: updateEmailError } = await supabase.auth.updateUser({ email })
          if (updateEmailError) throw updateEmailError
        }

        if (password) {
          const { error: updatePasswordError } = await supabase.auth.updateUser({ password })
          if (updatePasswordError) throw updatePasswordError
        }

        alert('Profile updated!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => router.push('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            type="url" 
            value={website} 
            onChange={(e) => setWebsite(e.target.value)} 
          />
        </div>
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter new password"
          />
        </div>
        <div>
          <Button onClick={updateProfile} disabled={loading}>
            {loading ? 'Loading ...' : 'Update Profile'}
          </Button>
        </div>
      </div>
    </div>
  )
}