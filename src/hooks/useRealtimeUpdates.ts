'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { DEMO_MODE } from '@/lib/demo-data'

interface ProblemUpdate {
  id: string
  contribution_count: number
  status: string
}

export function useRealtimeProblemUpdates(problemIds: string[]) {
  const [updates, setUpdates] = useState<Record<string, ProblemUpdate>>({})

  useEffect(() => {
    // Skip in demo mode
    if (DEMO_MODE || problemIds.length === 0) return

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupSubscription = () => {
      channel = supabase
        .channel('problems-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'problems',
            filter: `id=in.(${problemIds.join(',')})`,
          },
          (payload) => {
            const updated = payload.new as ProblemUpdate
            setUpdates((prev) => ({
              ...prev,
              [updated.id]: updated,
            }))
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [problemIds])

  const getUpdate = useCallback(
    (problemId: string) => updates[problemId],
    [updates]
  )

  return { updates, getUpdate }
}

export function useRealtimeSingleProblem(problemId: string | null) {
  const [problem, setProblem] = useState<ProblemUpdate | null>(null)

  useEffect(() => {
    // Skip in demo mode or if no problem ID
    if (DEMO_MODE || !problemId) return

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupSubscription = () => {
      channel = supabase
        .channel(`problem-${problemId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'problems',
            filter: `id=eq.${problemId}`,
          },
          (payload) => {
            setProblem(payload.new as ProblemUpdate)
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [problemId])

  return problem
}

// Hook for subscribing to synthesis completion
export function useRealtimeSynthesis(problemId: string | null, onSynthesisReady?: () => void) {
  useEffect(() => {
    if (DEMO_MODE || !problemId) return

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupSubscription = () => {
      channel = supabase
        .channel(`synthesis-${problemId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'syntheses',
            filter: `problem_id=eq.${problemId}`,
          },
          () => {
            onSynthesisReady?.()
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [problemId, onSynthesisReady])
}
