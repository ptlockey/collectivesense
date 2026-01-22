import { createClient } from '@/lib/supabase/server'
import { checkContentSafety } from '@/lib/claude'
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

  const { problem_id, content } = await request.json()

  if (!problem_id || !content) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
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
      // Trigger synthesis (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/synthesise/${problem_id}`, {
        method: 'POST',
      }).catch(console.error)
    }
  }

  return NextResponse.json({ success: true, flagged: !isSafe })
}
