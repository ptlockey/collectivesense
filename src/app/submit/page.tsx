'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
}

export default function SubmitPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  // Form data
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [situation, setSituation] = useState('')
  const [triedAlready, setTriedAlready] = useState('')
  const [desiredOutcome, setDesiredOutcome] = useState('')
  const [constraints, setConstraints] = useState('')

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
      // In demo mode, just show success
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

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="text-2xl font-semibold mb-4">Problem submitted</h1>
        <p className="text-secondary mb-6">
          In a real scenario, your problem would now be visible to other members who can contribute their thoughts.
          You&apos;d receive a synthesis once enough people have contributed.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          (This is demo mode - no data was actually saved)
        </p>
        <button
          onClick={() => router.push('/my-problems')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          View my problems
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-2">Share a problem</h1>
      <p className="text-secondary mb-8">
        Describe your situation and receive synthesised collective wisdom
      </p>

      {error && (
        <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
          {error}
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Category */}
      {step === 1 && (
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
                className={`p-4 border rounded-lg text-left hover:border-primary transition-colors ${
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
          </div>
        </div>
      )}

      {/* Step 2: Title and Situation */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Give it a brief title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g., Struggling with work-life balance"
            />
            <p className="text-xs text-secondary mt-1">
              {title.length}/100 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              What&apos;s the situation?
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Describe what you're facing. The more context you provide, the more helpful the collective wisdom will be."
            />
            <p className="text-xs text-secondary mt-1">
              Be specific - include relevant details about your situation
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-secondary hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!title.trim() || !situation.trim()}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Additional context */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
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

      {/* Step 4: Preview */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Preview your problem</h2>

          <div className="border border-border rounded-xl p-6 space-y-4">
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">
                {categories.find((c) => c.id === categoryId)?.name}
              </span>
              <h3 className="text-xl font-medium mt-1">{title}</h3>
            </div>

            <div>
              <h4 className="text-sm font-medium text-secondary mb-1">
                Situation
              </h4>
              <p className="whitespace-pre-wrap">{situation}</p>
            </div>

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
            Once submitted, your problem will be shown to other members who can
            contribute their thoughts. You&apos;ll receive a synthesis once
            enough people have contributed.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-secondary hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit problem'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
