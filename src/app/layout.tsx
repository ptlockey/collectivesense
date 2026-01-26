import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE, demoUser } from '@/lib/demo-data'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Collective Sense',
  description: 'Crowdsourced problem-solving through synthesised collective wisdom',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let user = null
  let isAdmin = false
  let notifications = { myRequests: 0, myContributions: 0 }

  if (DEMO_MODE) {
    // In demo mode, simulate a logged-in user
    user = demoUser
    notifications = { myRequests: 1, myContributions: 0 } // Demo has one complete problem
  } else {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ? { id: data.user.id, email: data.user.email ?? '' } : null

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      isAdmin = profile?.is_admin ?? false

      // Count completed requests (syntheses ready)
      const { count: requestsCount } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'complete')

      // Count completed contributions (problems user contributed to that are complete)
      const { data: contributions } = await supabase
        .from('contributions')
        .select('problem_id')
        .eq('user_id', user.id)

      let contributionsCount = 0
      if (contributions && contributions.length > 0) {
        const problemIds = contributions.map(c => c.problem_id)
        const { count } = await supabase
          .from('problems')
          .select('*', { count: 'exact', head: true })
          .in('id', problemIds)
          .eq('status', 'complete')
        contributionsCount = count || 0
      }

      notifications = {
        myRequests: requestsCount || 0,
        myContributions: contributionsCount,
      }
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen`}>
        {DEMO_MODE && (
          <div className="bg-primary text-white text-center py-2 text-sm">
            Demo Mode - exploring with sample data
          </div>
        )}
        <Nav user={user} isAdmin={isAdmin} notifications={notifications} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
          <p className="mb-3">Collective Sense - wisdom from many, not just one</p>
          <div className="flex justify-center gap-4">
            <a href="/faq" className="text-primary hover:text-primary-dark">
              FAQ
            </a>
            <span className="text-border">|</span>
            <a href="/support" className="text-primary hover:text-primary-dark">
              Support
            </a>
          </div>
        </footer>
      </body>
    </html>
  )
}
