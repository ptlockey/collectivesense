import { createClient } from '@/lib/supabase/server'
import { synthesiseContributions } from '@/lib/claude'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const { problemId } = await params
  const supabase = await createClient()

  // Authentication check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Fetch problem
  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .select('*, categories(name)')
    .eq('id', problemId)
    .single()

  if (problemError || !problem) {
    return NextResponse.json(
      { error: 'Problem not found' },
      { status: 404 }
    )
  }

  // Authorization check - only problem owner can trigger synthesis
  if (problem.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Forbidden - only the problem owner can trigger synthesis' },
      { status: 403 }
    )
  }

  // Rate limiting
  const rateLimitResult = checkRateLimit(`synthesise:${user.id}`, RATE_LIMITS.synthesise)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many synthesis requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
        },
      }
    )
  }

  // Check if already synthesised
  if (problem.status !== 'gathering') {
    return NextResponse.json(
      { error: 'Problem is not in gathering phase' },
      { status: 400 }
    )
  }

  // Update status to synthesising
  await supabase
    .from('problems')
    .update({ status: 'synthesising' })
    .eq('id', problemId)

  // Fetch contributions
  const { data: contributions } = await supabase
    .from('contributions')
    .select('content')
    .eq('problem_id', problemId)
    .eq('flagged_harmful', false)

  if (!contributions || contributions.length === 0) {
    await supabase
      .from('problems')
      .update({ status: 'gathering' })
      .eq('id', problemId)

    return NextResponse.json(
      { error: 'No contributions to synthesise' },
      { status: 400 }
    )
  }

  try {
    // Call Claude to synthesise
    const synthesis = await synthesiseContributions(
      {
        title: problem.title,
        category: (problem.categories as { name: string } | null)?.name || 'General',
        situation: problem.situation,
        tried_already: problem.tried_already,
        desired_outcome: problem.desired_outcome,
        constraints: problem.constraints,
        problem_type: problem.problem_type as 'advice' | 'opinion' | undefined,
      },
      contributions.map((c) => c.content)
    )

    // Store synthesis
    const { error: synthesisError } = await supabase.from('syntheses').insert({
      problem_id: problemId,
      summary: synthesis.summary,
      common_themes: synthesis.common_themes,
      divergent_views: synthesis.divergent_views,
      considerations: synthesis.considerations,
      warnings: synthesis.warnings,
      contribution_count: contributions.length,
    })

    if (synthesisError) {
      throw synthesisError
    }

    // Update problem status
    await supabase
      .from('problems')
      .update({ status: 'complete', updated_at: new Date().toISOString() })
      .eq('id', problemId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Synthesis error:', error)

    // Revert status
    await supabase
      .from('problems')
      .update({ status: 'gathering' })
      .eq('id', problemId)

    return NextResponse.json(
      { error: 'Failed to synthesise contributions' },
      { status: 500 }
    )
  }
}
