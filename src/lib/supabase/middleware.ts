import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // In demo mode (no Supabase URL), skip all auth checks
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes - require authentication
  const protectedRoutes = ['/submit', '/contribute', '/my-problems', '/onboard']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If user is logged in but hasn't confirmed ethos, redirect to onboard
  // (except if they're already on the onboard page)
  if (user && !request.nextUrl.pathname.startsWith('/onboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('ethos_confirmed_at')
      .eq('id', user.id)
      .single()

    if (profile && !profile.ethos_confirmed_at) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged in users away from auth pages
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
