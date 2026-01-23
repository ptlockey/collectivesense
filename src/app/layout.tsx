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

  if (DEMO_MODE) {
    // In demo mode, simulate a logged-in user
    user = demoUser
  } else {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user ? { id: data.user.id, email: data.user.email ?? '' } : null
  }

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen`}>
        {DEMO_MODE && (
          <div className="bg-primary text-white text-center py-2 text-sm">
            Demo Mode - exploring with sample data
          </div>
        )}
        <Nav user={user} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
          <p className="mb-2">Collective Sense - wisdom from many, not just one</p>
          <a href="/support" className="text-primary hover:text-primary-dark">
            Support this project
          </a>
        </footer>
      </body>
    </html>
  )
}
