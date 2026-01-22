'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HelpfulButtonProps {
  synthesisId: string
  initialHelpful: boolean
  helpfulCount: number
  isDemo?: boolean
}

export function HelpfulButton({
  synthesisId,
  initialHelpful,
  helpfulCount,
  isDemo = false,
}: HelpfulButtonProps) {
  const [isHelpful, setIsHelpful] = useState(initialHelpful)
  const [count, setCount] = useState(helpfulCount)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (isHelpful || loading) return

    setLoading(true)

    if (isDemo) {
      // In demo mode, just update local state
      setIsHelpful(true)
      setCount((c) => c + 1)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('helpful_flags').insert({
      synthesis_id: synthesisId,
      user_id: user.id,
    })

    if (!error) {
      setIsHelpful(true)
      setCount((c) => c + 1)

      await supabase.rpc('increment_helpful_count', {
        synthesis_id: synthesisId,
      })
    }

    setLoading(false)
  }

  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        disabled={isHelpful || loading}
        className={`px-6 py-3 rounded-lg transition-colors ${
          isHelpful
            ? 'bg-success/10 text-success cursor-default'
            : 'bg-accent hover:bg-accent-dark text-foreground'
        }`}
      >
        {isHelpful ? 'Thank you for your feedback' : 'This helped me'}
      </button>
      {count > 0 && (
        <p className="text-sm text-secondary mt-3">
          {count} {count === 1 ? 'person' : 'people'} found this helpful
        </p>
      )}
    </div>
  )
}
