'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE } from '@/lib/demo-data'
import { formatRelativeTime } from '@/lib/utils'

interface ContributionWithProblem {
  id: string
  content: string
  created_at: string
  problem: {
    id: string
    title: string
    status: string
    problem_type: 'advice' | 'opinion'
    contribution_count: number
    contribution_threshold: number
  }
  synthesis?: {
    id: string
    summary: string
    common_themes: Array<{ theme: string; explanation: string }> | null
    divergent_views: Array<{ view: string; alternative: string }> | null
  } | null
}

export default function MyContributionsPage() {
  const [contributions, setContributions] = useState<ContributionWithProblem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchContributions = async () => {
      if (DEMO_MODE) {
        // Demo data
        setContributions([
          {
            id: 'demo-contribution-1',
            content: 'I went through something similar last year. My advice would be to start by documenting all your achievements and the additional responsibilities you\'ve taken on. Then have a direct conversation with your manager about your career trajectory and compensation expectations. If they can\'t meet you halfway, that tells you something important about your future there.',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            problem: {
              id: 'demo-problem-1',
              title: 'Should I ask for a raise or look for a new job?',
              status: 'complete',
              problem_type: 'advice',
              contribution_count: 7,
              contribution_threshold: 5,
            },
            synthesis: {
              id: 'demo-synthesis-1',
              summary: 'The collective wisdom suggests approaching this as a two-track process: prepare a strong case for a raise at your current company while simultaneously exploring the market to understand your true value.',
              common_themes: [
                { theme: 'Know your market value first', explanation: 'Multiple contributors emphasised the importance of interviewing elsewhere, even if you hope to stay.' },
                { theme: 'Document your impact', explanation: 'Frame your raise request around business impact—revenue generated, costs saved, problems solved.' },
              ],
              divergent_views: [
                { view: 'Have the raise conversation now', alternative: 'Get an outside offer first to have leverage' },
              ],
            },
          },
        ])
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Get all contributions by this user with problem details
      const { data: contributionsData, error } = await supabase
        .from('contributions')
        .select(`
          id,
          content,
          created_at,
          problems (
            id,
            title,
            status,
            problem_type,
            contribution_count,
            contribution_threshold
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contributions:', error)
        setLoading(false)
        return
      }

      // For complete problems, fetch the synthesis
      const contributionsWithSynthesis: ContributionWithProblem[] = await Promise.all(
        (contributionsData || []).map(async (c) => {
          const problem = c.problems as ContributionWithProblem['problem']
          let synthesis: ContributionWithProblem['synthesis'] = null

          if (problem.status === 'complete') {
            const { data: synthesisData } = await supabase
              .from('syntheses')
              .select('id, summary, common_themes, divergent_views')
              .eq('problem_id', problem.id)
              .single()

            if (synthesisData) {
              synthesis = {
                id: synthesisData.id,
                summary: synthesisData.summary,
                common_themes: synthesisData.common_themes as Array<{ theme: string; explanation: string }> | null,
                divergent_views: synthesisData.divergent_views as Array<{ view: string; alternative: string }> | null,
              }
            }
          }

          return {
            id: c.id,
            content: c.content,
            created_at: c.created_at,
            problem,
            synthesis,
          }
        })
      )

      setContributions(contributionsWithSynthesis)
      setLoading(false)
    }

    fetchContributions()
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-secondary">Loading your contributions...</p>
      </div>
    )
  }

  if (contributions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">My Contributions</h1>
        <p className="text-secondary mb-6">You haven&apos;t contributed to any problems yet.</p>
        <Link
          href="/contribute"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Help someone now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-2">My Contributions</h1>
      <p className="text-secondary mb-8">
        Track the problems you&apos;ve helped with and see how your thoughts compare to the collective wisdom.
      </p>

      <div className="space-y-4">
        {contributions.map((contribution) => {
          const isExpanded = expandedId === contribution.id
          const isComplete = contribution.problem.status === 'complete'

          return (
            <div
              key={contribution.id}
              className="border border-border rounded-xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        contribution.problem.problem_type === 'opinion'
                          ? 'bg-highlight/10 text-highlight'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {contribution.problem.problem_type === 'opinion' ? 'Opinion' : 'Advice'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        isComplete
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {isComplete ? 'Synthesis ready' : `${contribution.problem.contribution_count}/${contribution.problem.contribution_threshold} contributions`}
                      </span>
                    </div>
                    <h2 className="font-medium">{contribution.problem.title}</h2>
                  </div>
                  <span className="text-xs text-secondary whitespace-nowrap">
                    {formatRelativeTime(contribution.created_at)}
                  </span>
                </div>

                {/* Your contribution */}
                <div className="bg-accent rounded-lg p-4">
                  <p className="text-xs font-medium text-secondary mb-2">Your contribution:</p>
                  <p className="text-sm whitespace-pre-wrap">{contribution.content}</p>
                </div>

                {/* Expand/collapse button for complete problems */}
                {isComplete && contribution.synthesis && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : contribution.id)}
                    className="mt-4 text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    {isExpanded ? 'Hide comparison ↑' : 'Compare with collective wisdom ↓'}
                  </button>
                )}
              </div>

              {/* Expanded comparison view */}
              {isExpanded && contribution.synthesis && (
                <div className="border-t border-border bg-muted/30 p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-secondary mb-2">
                      Collective {contribution.problem.problem_type === 'opinion' ? 'Opinion' : 'Wisdom'}:
                    </h3>
                    <p className="text-sm">{contribution.synthesis.summary}</p>
                  </div>

                  {contribution.synthesis.common_themes && contribution.synthesis.common_themes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-secondary mb-2">Common themes:</h4>
                      <ul className="space-y-2">
                        {contribution.synthesis.common_themes.slice(0, 3).map((theme, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-primary">•</span>
                            <span><strong>{theme.theme}</strong>: {theme.explanation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {contribution.synthesis.divergent_views && contribution.synthesis.divergent_views.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-secondary mb-2">Different perspectives:</h4>
                      <div className="text-sm p-3 bg-white rounded-lg border border-border">
                        <p><strong>Some say:</strong> {contribution.synthesis.divergent_views[0].view}</p>
                        <p className="mt-1"><strong>Others say:</strong> {contribution.synthesis.divergent_views[0].alternative}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-secondary pt-2">
                    See how your thoughts aligned with or differed from the collective perspective.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
