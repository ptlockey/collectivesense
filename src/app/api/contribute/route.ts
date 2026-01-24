import { createClient } from '@/lib/supabase/server'
import { checkContentSafety } from '@/lib/claude'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
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

  // Rate limiting
  const rateLimitResult = checkRateLimit(`contribute:${user.id}`, RATE_LIMITS.contribute)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
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

  // Input validation - max length for content
  const MAX_CONTENT_LENGTH = 10000
  if (typeof content !== 'string' || content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Content must be a string with at most ${MAX_CONTENT_LENGTH} characters` },
      { status: 400 }
    )
  }

  if (content.trim().length < 10) {
    return NextResponse.json(
      { error: 'Content must be at least 10 characters' },
      { status: 400 }
    )
  }

  // Check content safety
  const safetyResult = await checkContentSafety(content)

  // Insert contribution (flagged if unsafe)
  const { error } = await supabase.from('contributions').insert({
    problem_id,
    user_id: user.id,
    content,
    flagged_harmful: !safetyResult.safe,
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
  if (safetyResult.safe) {
    await supabase.rpc('increment_contribution_count', { problem_id })
    await supabase.rpc('increment_contributions_count', { user_id: user.id })

    // Check if we've reached the threshold
    const { data: problem } = await supabase
      .from('problems')
      .select('contribution_count, contribution_threshold, status')
      .eq('id', problem_id)
      .single()

    // Check if we've reached the threshold AND status is still gathering
    // This prevents race conditions where multiple contributions trigger synthesis
    if (
      problem &&
      problem.contribution_count >= problem.contribution_threshold &&
      problem.status === 'gathering'
    ) {
      // Atomically update status to synthesising to prevent duplicate triggers
      const { error: updateError } = await supabase
        .from('problems')
        .update({ status: 'synthesising' })
        .eq('id', problem_id)
        .eq('status', 'gathering') // Only update if still gathering

      // Only trigger synthesis if we successfully claimed the lock
      if (!updateError) {
        // Trigger synthesis (fire and forget)
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/synthesise/${problem_id}`, {
          method: 'POST',
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        }).catch(console.error)
      }
    }
  }

  return NextResponse.json({
    success: true,
    flagged: !safetyResult.safe,
    flagReason: safetyResult.reason,
  })
}
