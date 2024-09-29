'use client'

import Link from 'next/link'
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"

export default function SignUpSuccess() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Sign Up Successful!</CardTitle>
          <CardDescription>Please check your email to confirm your registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You won't be able to log in until you've confirmed your email address.</p>
          <Link href="/signin" passHref>
            <Button className="w-full">Return to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}