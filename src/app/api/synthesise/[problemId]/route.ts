import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { synthesiseContributions } from '@/lib/claude'
import { checkRateLimit, getClientIdentifier, rateLimits } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const { problemId } = await params
  const supabase = await createClient()

  // Verify the request is authenticated (either from internal trigger or admin)
  const { data: { user } } = await supabase.auth.getUser()

  // Allow internal calls (from contribute API) via a secret header
  const internalSecret = request.headers.get('x-internal-secret')
  const isInternalCall = internalSecret === process.env.INTERNAL_API_SECRET

  if (!user && !isInternalCall) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Rate limiting (skip for internal calls)
  if (!isInternalCall) {
    const identifier = user ? `synthesise:${user.id}` : `synthesise:${getClientIdentifier(request)}`
    const rateLimitResult = checkRateLimit(identifier, rateLimits.synthesise)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.resetIn.toString(),
          },
        }
      )
    }
  }

  // Use admin client to bypass RLS for reading all contributions
  const adminClient = createAdminClient()

  // Fetch problem
  const { data: problem, error: problemError } = await adminClient
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

  // Check if already synthesised
  if (problem.status !== 'gathering') {
    return NextResponse.json(
      { error: 'Problem is not in gathering phase' },
      { status: 400 }
    )
  }

  // Update status to synthesising
  await adminClient
    .from('problems')
    .update({ status: 'synthesising' })
    .eq('id', problemId)

  // Fetch contributions (admin client bypasses RLS to see all contributions)
  const { data: contributions } = await adminClient
    .from('contributions')
    .select('content')
    .eq('problem_id', problemId)
    .eq('flagged_harmful', false)

  if (!contributions || contributions.length === 0) {
    await adminClient
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
    const { error: synthesisError } = await adminClient.from('syntheses').insert({
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
    await adminClient
      .from('problems')
      .update({ status: 'complete', updated_at: new Date().toISOString() })
      .eq('id', problemId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Synthesis error:', error)

    // Revert status
    await adminClient
      .from('problems')
      .update({ status: 'gathering' })
      .eq('id', problemId)

    return NextResponse.json(
      { error: 'Failed to synthesise contributions' },
      { status: 500 }
    )
  }
}
