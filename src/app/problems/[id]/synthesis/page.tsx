import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE, demoProblems, demoSynthesis } from '@/lib/demo-data'
import type { SynthesisParsed } from '@/types'
import { HelpfulButton } from './HelpfulButton'

interface SynthesisPageProps {
  params: Promise<{ id: string }>
}

export default async function SynthesisPage({ params }: SynthesisPageProps) {
  const { id } = await params

  let problem: typeof demoProblems[0] | null = null
  let parsedSynthesis: SynthesisParsed | null = null
  let hasMarkedHelpful = false

  if (DEMO_MODE) {
    // In demo mode, find the demo problem and use demo synthesis
    problem = demoProblems.find(p => p.id === id) || null

    if (!problem || problem.status !== 'complete') {
      // For demo, redirect non-complete problems to a complete one
      if (id !== 'demo-problem-1') {
        notFound()
      }
      problem = demoProblems[0]
    }

    parsedSynthesis = demoSynthesis
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: problemData } = await supabase
      .from('problems')
      .select('*, categories(name)')
      .eq('id', id)
      .single()

    if (!problemData) {
      notFound()
    }

    if (problemData.user_id !== user?.id) {
      notFound()
    }

    problem = problemData as typeof demoProblems[0]

    const { data: synthesis } = await supabase
      .from('syntheses')
      .select('*')
      .eq('problem_id', id)
      .single()

    if (!synthesis) {
      return (
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h1 className="text-xl font-semibold mb-4">Synthesis not ready yet</h1>
          <p className="text-secondary">
            The synthesis will be available once enough people have contributed.
          </p>
        </div>
      )
    }

    parsedSynthesis = {
      ...synthesis,
      common_themes: synthesis.common_themes as SynthesisParsed['common_themes'],
      divergent_views: synthesis.divergent_views as SynthesisParsed['divergent_views'],
      considerations: synthesis.considerations as SynthesisParsed['considerations'],
      warnings: synthesis.warnings as SynthesisParsed['warnings'],
    }

    const { data: helpfulFlag } = await supabase
      .from('helpful_flags')
      .select('id')
      .eq('synthesis_id', synthesis.id)
      .eq('user_id', user?.id || '')
      .single()

    hasMarkedHelpful = !!helpfulFlag
  }

  if (!problem || !parsedSynthesis) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Original problem - collapsed */}
      <details className="mb-8 border border-border rounded-xl">
        <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-secondary hover:text-foreground">
          {problem.problem_type === 'opinion' ? 'Your original question' : 'Your original request'}
        </summary>
        <div className="px-5 pb-5 pt-2 border-t border-border">
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
          <h2 className="font-medium mt-1 mb-3">{problem.title}</h2>
          {problem.situation && (
            <p className="text-sm whitespace-pre-wrap">{problem.situation}</p>
          )}
        </div>
      </details>

      {/* Synthesis */}
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            {problem.problem_type === 'opinion' ? 'Collective Opinion' : 'Collective Wisdom'}
          </h1>
          <p className="text-sm text-secondary">
            Synthesised from {parsedSynthesis.contribution_count} contributions
          </p>
        </div>

        {/* Summary */}
        <div>
          <p className="text-lg leading-relaxed">{parsedSynthesis.summary}</p>
        </div>

        {/* Common Themes */}
        {parsedSynthesis.common_themes && parsedSynthesis.common_themes.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Common Themes</h2>
            <div className="space-y-4">
              {parsedSynthesis.common_themes.map((theme, i) => (
                <div key={i} className="p-4 bg-accent rounded-lg">
                  <h3 className="font-medium mb-1">{theme.theme}</h3>
                  <p className="text-sm text-secondary">{theme.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divergent Views */}
        {parsedSynthesis.divergent_views && parsedSynthesis.divergent_views.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Divergent Views</h2>
            <div className="space-y-4">
              {parsedSynthesis.divergent_views.map((view, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-secondary mb-1">Some suggest:</p>
                      <p>{view.view}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary mb-1">Others suggest:</p>
                      <p>{view.alternative}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Considerations */}
        {parsedSynthesis.considerations && parsedSynthesis.considerations.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Things to Consider</h2>
            <ul className="space-y-2">
              {parsedSynthesis.considerations.map((consideration, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-primary">-</span>
                  <span>{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {parsedSynthesis.warnings && parsedSynthesis.warnings.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Cautions Raised</h2>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <ul className="space-y-2">
                {parsedSynthesis.warnings.map((warning, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-warning">!</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Helpful button */}
        <div className="pt-6 border-t border-border">
          <HelpfulButton
            synthesisId={parsedSynthesis.id}
            initialHelpful={hasMarkedHelpful}
            helpfulCount={parsedSynthesis.helpful_count}
            isDemo={DEMO_MODE}
          />
        </div>
      </div>
    </div>
  )
}
