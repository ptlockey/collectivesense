'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE, demoProblemToContribute } from '@/lib/demo-data'
import type { ProblemWithCategory } from '@/types'

export default function ContributePage() {
  const [problem, setProblem] = useState<ProblemWithCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [contribution, setContribution] = useState('')
  const [noProblems, setNoProblems] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const fetchProblem = useCallback(async () => {
    setLoading(true)
    setContribution('')
    setJustSubmitted(false)

    if (DEMO_MODE) {
      // In demo mode, show the sample problem
      setProblem(demoProblemToContribute)
      setNoProblems(false)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: contributions } = await supabase
      .from('contributions')
      .select('problem_id')
      .eq('user_id', user.id)

    const contributedIds = contributions?.map((c) => c.problem_id) || []

    let query = supabase
      .from('problems')
      .select('*, categories(*)')
      .eq('status', 'gathering')
      .neq('user_id', user.id)
      .order('contribution_count', { ascending: false })
      .limit(1)

    if (contributedIds.length > 0) {
      query = query.not('id', 'in', `(${contributedIds.join(',')})`)
    }

    const { data: problems } = await query

    if (!problems || problems.length === 0) {
      setNoProblems(true)
      setProblem(null)
    } else {
      setProblem(problems[0] as ProblemWithCategory)
      setNoProblems(false)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProblem()
  }, [fetchProblem])

  const handleSubmit = async () => {
    if (!problem || !contribution.trim()) return

    setSubmitting(true)

    if (DEMO_MODE) {
      // In demo mode, just show the thank you message
      setJustSubmitted(true)
      setSubmitting(false)
      setTimeout(() => {
        // In demo, show "no more problems" after contributing
        setNoProblems(true)
        setJustSubmitted(false)
      }, 1500)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('contributions').insert({
      problem_id: problem.id,
      user_id: user.id,
      content: contribution,
    })

    if (error) {
      console.error('Error submitting contribution:', error)
      setSubmitting(false)
      return
    }

    await supabase.rpc('increment_contribution_count', {
      problem_id: problem.id,
    })

    await supabase.rpc('increment_contributions_count', { user_id: user.id })

    setJustSubmitted(true)
    setSubmitting(false)

    setTimeout(() => {
      fetchProblem()
    }, 1500)
  }

  const handleSkip = () => {
    if (DEMO_MODE) {
      setNoProblems(true)
      return
    }
    fetchProblem()
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-secondary">Finding a problem to help with...</p>
      </div>
    )
  }

  if (noProblems) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">No problems to help with</h1>
        <p className="text-secondary mb-6">
          {DEMO_MODE
            ? "You've seen the demo problem. In a real scenario, there would be many problems from other users to help with."
            : "You've contributed to all available problems, or there are no problems in the gathering phase right now."}
        </p>
        <p className="text-secondary">Check back later, or submit your own problem.</p>
      </div>
    )
  }

  if (justSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-xl text-primary">Thank you</p>
        <p className="text-secondary mt-2">
          {DEMO_MODE ? 'Your contribution would join others to form collective wisdom.' : 'Finding the next problem...'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Help someone</h1>
        <button
          onClick={handleSkip}
          className="text-sm text-secondary hover:text-foreground"
        >
          Skip this one
        </button>
      </div>

      {problem && (
        <>
          {/* Problem display */}
          <div className="border border-border rounded-xl p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  problem.problem_type === 'opinion'
                    ? 'bg-highlight/10 text-highlight'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {problem.problem_type === 'opinion' ? 'Opinion' : 'Advice'}
                </span>
                <span className="text-xs text-secondary">
                  {problem.categories?.name}
                </span>
              </div>
              <h2 className="text-xl font-medium mt-1">{problem.title}</h2>
            </div>

            <div className="space-y-4 text-sm">
              {problem.situation && (
              <div>
                <h3 className="font-medium text-secondary mb-1">
                  {problem.problem_type === 'opinion' ? 'Context' : 'Situation'}
                </h3>
                <p className="whitespace-pre-wrap">{problem.situation}</p>
              </div>
              )}

              {problem.tried_already && (
                <div>
                  <h3 className="font-medium text-secondary mb-1">
                    Already tried
                  </h3>
                  <p className="whitespace-pre-wrap">{problem.tried_already}</p>
                </div>
              )}

              {problem.desired_outcome && (
                <div>
                  <h3 className="font-medium text-secondary mb-1">
                    Desired outcome
                  </h3>
                  <p className="whitespace-pre-wrap">{problem.desired_outcome}</p>
                </div>
              )}

              {problem.constraints && (
                <div>
                  <h3 className="font-medium text-secondary mb-1">
                    Constraints
                  </h3>
                  <p className="whitespace-pre-wrap">{problem.constraints}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-secondary">
                {problem.contribution_count} of {problem.contribution_threshold}{' '}
                contributions
              </p>
            </div>
          </div>

          {/* Contribution form */}
          <div>
            <div className="mb-3">
              <p className="text-sm text-secondary">
                {problem.problem_type === 'opinion'
                  ? 'What\'s your take on this?'
                  : 'What thoughts or suggestions do you have?'}
              </p>
            </div>

            <textarea
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
              placeholder={
                problem.problem_type === 'opinion'
                  ? "Share your opinion and reasoning - what do you think and why?"
                  : "Share what you'd suggest, what's worked in similar situations, or what they should consider..."
              }
            />

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!contribution.trim() || submitting}
                className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit & Next'}
              </button>
            </div>

            <p className="text-xs text-secondary mt-4 text-center">
              Your contribution will join others to form collective wisdom.
              <br />
              Individual responses are never shown.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
