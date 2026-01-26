import { createClient } from '@/lib/supabase/server'
import { checkContentSafety } from '@/lib/claude'
import { checkRateLimit, getClientIdentifier, rateLimits } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Rate limiting - use user ID for authenticated requests
  const rateLimitResult = checkRateLimit(`contribute:${user.id}`, rateLimits.contribute)
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

  const { problem_id, content } = await request.json()

  if (!problem_id || !content) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Validate content length (prevent abuse)
  if (typeof content !== 'string' || content.length > 10000) {
    return NextResponse.json(
      { error: 'Content must be under 10,000 characters' },
      { status: 400 }
    )
  }

  // Validate problem exists, is in gathering status, and user doesn't own it
  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .select('id, user_id, status')
    .eq('id', problem_id)
    .single()

  if (problemError || !problem) {
    return NextResponse.json(
      { error: 'Problem not found' },
      { status: 404 }
    )
  }

  if (problem.status !== 'gathering') {
    return NextResponse.json(
      { error: 'Problem is not accepting contributions' },
      { status: 400 }
    )
  }

  if (problem.user_id === user.id) {
    return NextResponse.json(
      { error: 'Cannot contribute to your own problem' },
      { status: 403 }
    )
  }

  // Check content safety
  const isSafe = await checkContentSafety(content)

  // Insert contribution (flagged if unsafe)
  const { error } = await supabase.from('contributions').insert({
    problem_id,
    user_id: user.id,
    content,
    flagged_harmful: !isSafe,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You have already contributed to this problem' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to submit contribution' },
      { status: 500 }
    )
  }

  // Only increment count if not flagged
  if (isSafe) {
    await supabase.rpc('increment_contribution_count', { problem_id })
    await supabase.rpc('increment_contributions_count', { user_id: user.id })

    // Check if we've reached the threshold
    const { data: problem } = await supabase
      .from('problems')
      .select('contribution_count, contribution_threshold')
      .eq('id', problem_id)
      .single()

    if (
      problem &&
      problem.contribution_count >= problem.contribution_threshold
    ) {
      // Trigger synthesis (fire and forget) with internal secret
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/synthesise/${problem_id}`, {
        method: 'POST',
        headers: {
          'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
        },
      }).catch(console.error)
    }
  }

  return NextResponse.json({ success: true, flagged: !isSafe })
}
