'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Debug: Test step by step
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Test 1: Simple fetch without auth
    try {
      console.log('Test 1: Simple GET...')
      const r1 = await fetch('https://httpbin.org/get')
      console.log('Test 1 passed:', r1.status)
    } catch (e) {
      console.error('Test 1 failed:', e)
    }

    // Test 2: Fetch with Content-Type only
    try {
      console.log('Test 2: POST with Content-Type only...')
      const r2 = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      console.log('Test 2 status:', r2.status)
    } catch (e) {
      console.error('Test 2 failed:', e)
    }

    // Test 3: Scan key for invalid characters
    console.log('Test 3: Scanning key for invalid chars...')
    const validChars = /^[A-Za-z0-9._-]+$/
    if (!validChars.test(key)) {
      console.log('Key contains invalid characters!')
      for (let i = 0; i < key.length; i++) {
        const char = key[i]
        const code = key.charCodeAt(i)
        if (!/[A-Za-z0-9._-]/.test(char)) {
          console.log(`Invalid char at position ${i}: "${char}" (code: ${code})`)
        }
      }
    } else {
      console.log('Key chars look valid, trying fetch...')
      try {
        const r3 = await fetch(`${url}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': key,
          },
          body: JSON.stringify({ email, password }),
        })
        console.log('Test 3 status:', r3.status)
      } catch (e) {
        console.error('Test 3 failed:', e)
      }
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect to onboarding
    router.push('/onboard')
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-2">Join Collective Wisdom</h1>
      <p className="text-secondary mb-8">
        Help others and receive help in return
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  )
}
