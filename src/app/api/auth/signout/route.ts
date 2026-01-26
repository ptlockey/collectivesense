import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Use request origin to prevent redirect manipulation
  const redirectUrl = new URL('/', request.nextUrl.origin)
  return NextResponse.redirect(redirectUrl)
}
