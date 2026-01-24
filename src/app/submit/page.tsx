'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE, demoCategories } from '@/lib/demo-data'
import type { Category } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'life-admin': '📋',
  'finances': '💰',
  'work': '💼',
  'relationships': '❤️',
  'parenting': '👶',
  'health': '🏥',
  'practical': '🔧',
  'decisions': '🤔',
  'other': '💡',
}

const ADVICE_EXAMPLES = [
  "Should I ask for a raise or look for a new job?",
  "How do I handle a difficult conversation with my teenager?",
  "I'm struggling with work-life balance - what can I change?",
  "How should I approach paying off multiple debts?",
]

const OPINION_EXAMPLES = [
  "Is Tesco better than Sainsbury's for weekly shopping?",
  "iPhone or Android - which is better for everyday use?",
  "Is it worth getting a dashcam?",
  "Are standing desks actually worth it?",
]

function SubmitForm() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const initialType = typeParam === 'advice' || typeParam === 'opinion' ? typeParam : null

  const [categories, setCategories] = useState<Category[]>([])
  // Skip type selection if type is in URL; opinions skip to step 2 (no category)
  const [step, setStep] = useState(initialType ? (initialType === 'opinion' ? 2 : 1) : 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  // Form data
  const [problemType, setProblemType] = useState<'advice' | 'opinion' | null>(initialType)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [situation, setSituation] = useState('')
  const [triedAlready, setTriedAlready] = useState('')
  const [desiredOutcome, setDesiredOutcome] = useState('')
  const [constraints, setConstraints] = useState('')

  // Reset form when navigating to /submit without type param (e.g., clicking "Get Wisdom")
  useEffect(() => {
    if (!typeParam) {
      setStep(0)
      setProblemType(null)
      setCategoryId(null)
      setTitle('')
      setSituation('')
      setTriedAlready('')
      setDesiredOutcome('')
      setConstraints('')
      setSubmitted(false)
      setError(null)
    }
  }, [typeParam])

  useEffect(() => {
    const fetchCategories = async () => {
      if (DEMO_MODE) {
        setCategories(demoCategories)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleSubmit = async () => {
    if (DEMO_MODE) {
      setSubmitted(true)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase.from('problems').insert({
      user_id: user.id,
      title,
      category_id: categoryId,
      situation,
      tried_already: triedAlready || null,
      desired_outcome: desiredOutcome || null,
      constraints: constraints || null,
      problem_type: problemType ?? undefined,
      contribution_threshold: 5,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    await supabase.rpc('increment_problems_submitted', { user_id: user.id })

    router.push('/my-problems')
  }

  // Opinion: step 2 (question) → step 3 (preview) = 2 steps
  // Advice: step 1 (category) → step 2 (title) → step 3 (context) → step 4 (preview) = 4 steps
  const totalSteps = problemType === 'opinion' ? 2 : 4

  // Calculate progress step for the indicator
  const getProgressStep = () => {
    if (problemType === 'opinion') {
      // Opinion: step 2 = progress 1, step 3 = progress 2
      return step - 1
    }
    // Advice: step 1-4 maps directly to progress 1-4
    return step
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="text-2xl font-semibold mb-4">
          {problemType === 'opinion' ? 'Opinion request submitted' : 'Advice request submitted'}
        </h1>
        <p className="text-secondary mb-6">
          Your {problemType === 'opinion' ? 'question' : 'situation'} is now visible to other members who can contribute their thoughts.
          You&apos;ll receive a synthesis once enough people have contributed.
        </p>
        {DEMO_MODE && (
          <p className="text-sm text-muted-foreground mb-8">
            (This is demo mode - no data was actually saved)
          </p>
        )}
        <button
          onClick={() => router.push('/my-problems')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          View my requests
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-2">Get Collective Wisdom</h1>
      <p className="text-secondary mb-8">
        Ask for advice on a situation or get opinions on a decision
      </p>

      {error && (
        <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      {/* Progress indicator - only show after type selection */}
      {step > 0 && (
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= getProgressStep() ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step 0: Choose type */}
      {step === 0 && (
        <div>
          <h2 className="text-lg font-medium mb-6">What would you like?</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Advice option */}
            <button
              onClick={() => {
                setProblemType('advice')
                setStep(1)
              }}
              className="p-6 bg-white border-2 border-border rounded-2xl text-left hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20">
                <span className="text-2xl">💭</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Collective Advice</h3>
              <p className="text-secondary text-sm mb-4">
                Get synthesised wisdom from multiple people on a situation you&apos;re facing
              </p>
              <p className="text-xs text-muted-foreground">
                Best for: personal dilemmas, decisions, challenges
              </p>
            </button>

            {/* Opinion option */}
            <button
              onClick={() => {
                setProblemType('opinion')
                setStep(2) // Skip category selection for opinions
              }}
              className="p-6 bg-white border-2 border-border rounded-2xl text-left hover:border-highlight hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-highlight/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-highlight/20">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Collective Opinion</h3>
              <p className="text-secondary text-sm mb-4">
                Find out what people think about a choice, product, or comparison
              </p>
              <p className="text-xs text-muted-foreground">
                Best for: comparisons, recommendations, preferences
              </p>
            </button>
          </div>

          {/* Examples */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-accent rounded-2xl p-5">
              <p className="text-sm font-medium mb-3 text-primary">Advice examples:</p>
              <ul className="space-y-2">
                {ADVICE_EXAMPLES.map((ex, i) => (
                  <li key={i} className="text-sm text-secondary flex gap-2">
                    <span className="text-primary">•</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-accent rounded-2xl p-5">
              <p className="text-sm font-medium mb-3 text-highlight">Opinion examples:</p>
              <ul className="space-y-2">
                {OPINION_EXAMPLES.map((ex, i) => (
                  <li key={i} className="text-sm text-secondary flex gap-2">
                    <span className="text-highlight">•</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Category (advice only) */}
      {step === 1 && problemType === 'advice' && (
        <div>
          <h2 className="text-lg font-medium mb-4">What area is this about?</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryId(cat.id)
                  setStep(2)
                }}
                className={`p-4 border rounded-xl text-left hover:border-primary transition-colors ${
                  categoryId === cat.id ? 'border-primary bg-accent' : 'border-border'
                }`}
              >
                <span className="text-2xl mb-2 block">
                  {CATEGORY_ICONS[cat.slug] || cat.icon || '📌'}
                </span>
                <span className="font-medium">{cat.name}</span>
                {cat.description && (
                  <span className="text-sm text-secondary block mt-1">
                    {cat.description}
                  </span>
                )}
              </button>
            ))}
            {/* Other option */}
            <button
              onClick={() => {
                setCategoryId(null)
                setStep(2)
              }}
              className={`p-4 border rounded-xl text-left hover:border-primary transition-colors ${
                categoryId === null ? 'border-primary bg-accent' : 'border-border'
              }`}
            >
              <span className="text-2xl mb-2 block">💡</span>
              <span className="font-medium">Other</span>
              <span className="text-sm text-secondary block mt-1">
                Something else
              </span>
            </button>
          </div>
          <button
            onClick={() => setStep(0)}
            className="mt-4 px-4 py-2 text-secondary hover:text-foreground"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 2: Title and Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              {problemType === 'opinion' ? 'Your question' : 'Give it a brief title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder={
                problemType === 'opinion'
                  ? 'e.g., Is it worth switching to an electric car?'
                  : 'e.g., Struggling with work-life balance'
              }
            />
            <p className="text-xs text-secondary mt-1">
              {title.length}/100 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              {problemType === 'opinion' ? 'Add any context (optional)' : "What's the situation?"}
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={problemType === 'opinion' ? 4 : 6}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder={
                problemType === 'opinion'
                  ? 'Any specific things you want people to consider? (e.g., budget, use case, priorities)'
                  : 'Describe what you\'re facing. The more context you provide, the more helpful the collective wisdom will be.'
              }
            />
            {problemType !== 'opinion' && (
              <p className="text-xs text-secondary mt-1">
                Be specific - include relevant details about your situation
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(problemType === 'opinion' ? 0 : 1)}
              className="px-4 py-2 text-secondary hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!title.trim() || (problemType === 'advice' && !situation.trim())}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {problemType === 'opinion' ? 'Preview' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Additional context (advice only) */}
      {step === 3 && problemType === 'advice' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              What have you already tried?{' '}
              <span className="text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              value={triedAlready}
              onChange={(e) => setTriedAlready(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="This helps people understand what hasn't worked and suggest alternatives"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              What would a good outcome look like?{' '}
              <span className="text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Helps contributors understand what you're hoping to achieve"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Any constraints or limitations?{' '}
              <span className="text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Budget, time, relationships, or other factors that limit options"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-secondary hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Preview
            </button>
          </div>
        </div>
      )}

      {/* Preview step */}
      {((step === 3 && problemType === 'opinion') || (step === 4 && problemType === 'advice')) && (
        <div>
          <h2 className="text-lg font-medium mb-4">Preview your request</h2>

          <div className="border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                problemType === 'opinion'
                  ? 'bg-highlight/10 text-highlight'
                  : 'bg-primary/10 text-primary'
              }`}>
                {problemType === 'opinion' ? 'Opinion' : 'Advice'}
              </span>
              {categoryId && (
                <span className="text-xs text-secondary">
                  {categories.find((c) => c.id === categoryId)?.name}
                </span>
              )}
              {!categoryId && problemType === 'advice' && (
                <span className="text-xs text-secondary">Other</span>
              )}
            </div>

            <h3 className="text-xl font-medium">{title}</h3>

            {situation && (
              <div>
                <h4 className="text-sm font-medium text-secondary mb-1">
                  {problemType === 'opinion' ? 'Context' : 'Situation'}
                </h4>
                <p className="whitespace-pre-wrap">{situation}</p>
              </div>
            )}

            {triedAlready && (
              <div>
                <h4 className="text-sm font-medium text-secondary mb-1">
                  Already tried
                </h4>
                <p className="whitespace-pre-wrap">{triedAlready}</p>
              </div>
            )}

            {desiredOutcome && (
              <div>
                <h4 className="text-sm font-medium text-secondary mb-1">
                  Desired outcome
                </h4>
                <p className="whitespace-pre-wrap">{desiredOutcome}</p>
              </div>
            )}

            {constraints && (
              <div>
                <h4 className="text-sm font-medium text-secondary mb-1">
                  Constraints
                </h4>
                <p className="whitespace-pre-wrap">{constraints}</p>
              </div>
            )}
          </div>

          <p className="text-sm text-secondary mt-4">
            Once submitted, your {problemType === 'opinion' ? 'question' : 'situation'} will be shown to other members who can
            contribute their thoughts. You&apos;ll receive a synthesis once
            enough people have contributed.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(problemType === 'opinion' ? 2 : 3)}
              className="px-4 py-2 text-secondary hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : `Submit ${problemType === 'opinion' ? 'question' : 'request'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-12 text-center text-secondary">Loading...</div>}>
      <SubmitForm />
    </Suspense>
  )
}
