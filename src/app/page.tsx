import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE, demoProfile, demoProblems, demoUser } from '@/lib/demo-data'

export default async function HomePage() {
  if (DEMO_MODE) {
    // In demo mode, show dashboard with demo data
    return <Dashboard userId={demoUser.id} isDemo />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return <Dashboard userId={user.id} isDemo={false} />
  }

  return <LandingPage />
}

function LandingPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-semibold text-foreground mb-4">
          Collective Wisdom
        </h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
          Share your problems. Help others with theirs. Receive synthesised
          wisdom from people who care.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Join the community
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary font-semibold">
              1
            </div>
            <h3 className="font-medium mb-2">Share a problem</h3>
            <p className="text-secondary text-sm">
              Describe what you&apos;re facing. Be specific about your situation,
              constraints, and what you&apos;ve tried.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary font-semibold">
              2
            </div>
            <h3 className="font-medium mb-2">Others contribute</h3>
            <p className="text-secondary text-sm">
              Anonymous contributors share their thoughts, suggestions, and
              experiences. No one sees individual responses.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary font-semibold">
              3
            </div>
            <h3 className="font-medium mb-2">Receive synthesis</h3>
            <p className="text-secondary text-sm">
              AI synthesises the collective wisdom into themes, common
              suggestions, and divergent views.
            </p>
          </div>
        </div>
      </div>

      {/* What makes this different */}
      <div className="bg-accent rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-6 text-center">
          This is different
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="flex gap-3">
            <span className="text-primary">-</span>
            <p>
              <strong>No individual responses shown</strong> - contributions join
              a collective pool
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-primary">-</span>
            <p>
              <strong>No likes or followers</strong> - you can&apos;t build an
              audience here
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-primary">-</span>
            <p>
              <strong>No notifications</strong> - just &quot;your synthesis is
              ready&quot;
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-primary">-</span>
            <p>
              <strong>Ego-free by design</strong> - you can&apos;t point to
              &quot;your&quot; advice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

async function Dashboard({ userId, isDemo }: { userId: string; isDemo: boolean }) {
  let profile = null
  let completedProblems: Array<{ id: string; title: string; status: string }> = []

  if (isDemo) {
    profile = demoProfile
    completedProblems = demoProblems
      .filter(p => p.status === 'complete')
      .map(p => ({ id: p.id, title: p.title, status: p.status }))
  } else {
    const supabase = await createClient()

    const { data: profileData } = await supabase
      .from('profiles')
      .select('contributions_count, problems_submitted')
      .eq('id', userId)
      .single()

    profile = profileData

    const { data: problemsData } = await supabase
      .from('problems')
      .select('id, title, status')
      .eq('user_id', userId)
      .eq('status', 'complete')
      .order('updated_at', { ascending: false })
      .limit(3)

    completedProblems = problemsData || []
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold mb-8">Welcome back</h1>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/contribute"
          className="block p-6 border border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-colors group"
        >
          <h2 className="text-lg font-medium mb-2 group-hover:text-primary">
            Help others
          </h2>
          <p className="text-secondary text-sm">
            Share your thoughts on problems others are facing
          </p>
        </Link>

        <Link
          href="/submit"
          className="block p-6 border border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-colors group"
        >
          <h2 className="text-lg font-medium mb-2 group-hover:text-primary">
            Share a problem
          </h2>
          <p className="text-secondary text-sm">
            Get collective wisdom on something you&apos;re facing
          </p>
        </Link>
      </div>

      {/* Stats - understated */}
      {profile && (
        <div className="flex gap-8 text-sm text-secondary mb-12">
          <p>
            Problems shared:{' '}
            <span className="text-foreground">{profile.problems_submitted}</span>
          </p>
          <p>
            Contributions made:{' '}
            <span className="text-foreground">{profile.contributions_count}</span>
          </p>
        </div>
      )}

      {/* Syntheses ready */}
      {completedProblems && completedProblems.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Syntheses ready</h2>
          <div className="space-y-3">
            {completedProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.id}/synthesis`}
                className="block p-4 border border-border rounded-lg hover:border-primary transition-colors"
              >
                <p className="font-medium">{problem.title}</p>
                <p className="text-sm text-success mt-1">Synthesis ready</p>
              </Link>
            ))}
          </div>
          <Link
            href="/my-problems"
            className="inline-block mt-4 text-sm text-primary hover:text-primary-dark"
          >
            View all problems
          </Link>
        </div>
      )}
    </div>
  )
}
