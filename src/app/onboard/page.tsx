'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardPage() {
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Update or create profile with ethos confirmation
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ethos_confirmed_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error confirming ethos:', error)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-8">
        Welcome to Collective Wisdom
      </h1>

      {/* How it works */}
      <div className="mb-10 space-y-6">
        <div className="p-6 bg-accent rounded-xl">
          <h2 className="font-medium mb-3">This works differently</h2>
          <ul className="space-y-3 text-sm text-secondary">
            <li className="flex gap-3">
              <span className="text-primary font-medium">1.</span>
              <p>
                Your contributions join others to form{' '}
                <strong className="text-foreground">collective wisdom</strong>.
                No one sees individual responses - including you.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-medium">2.</span>
              <p>
                There are no likes, followers, or notifications. You can&apos;t
                build an audience here.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-medium">3.</span>
              <p>
                When you share a problem, you receive a{' '}
                <strong className="text-foreground">synthesis</strong> of what
                multiple people suggested - themes, common advice, and divergent
                views.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* The pledge */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">A moment of intention</h2>
        <p className="text-secondary mb-6">
          This community works because people contribute thoughtfully and
          kindly. Before you begin, please take a moment to commit to these
          principles:
        </p>

        <div className="border border-border rounded-xl p-6 space-y-4">
          <label className="flex gap-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <div className="space-y-3 text-sm">
              <p>
                <strong>I will contribute thoughtfully and kindly.</strong>
                <br />
                <span className="text-secondary">
                  Real people are reading my words. I&apos;ll offer what I
                  genuinely believe might help.
                </span>
              </p>
              <p>
                <strong>
                  I understand my words become part of a whole, not a personal
                  post.
                </strong>
                <br />
                <span className="text-secondary">
                  I won&apos;t be able to point to &quot;my&quot; advice or see
                  how people reacted to it specifically.
                </span>
              </p>
              <p>
                <strong>
                  I&apos;m here to help and be helped, not to perform.
                </strong>
                <br />
                <span className="text-secondary">
                  This isn&apos;t about building a following or getting
                  recognition. It&apos;s about strangers helping strangers.
                </span>
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleConfirm}
        disabled={!confirmed || loading}
        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Entering...' : 'Enter Collective Wisdom'}
      </button>
    </div>
  )
}
