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
    <div className="py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="inline-block mb-6 px-4 py-2 bg-accent rounded-full text-sm text-primary font-medium">
          A different kind of advice
        </div>
        <h1 className="text-5xl font-semibold text-foreground mb-6 leading-tight">
          Wisdom from many,<br />
          <span className="text-primary">not just one</span>
        </h1>
        <p className="text-xl text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          Share what you&apos;re facing. Receive synthesised insights from people who&apos;ve been there.
          No individual responses. No ego. Just collective wisdom.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all font-medium text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Join the community
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white border-2 border-border text-foreground rounded-2xl hover:border-primary hover:bg-accent transition-all font-medium text-lg"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-20">
        <h2 className="text-2xl font-semibold text-center mb-4">
          How it works
        </h2>
        <p className="text-secondary text-center mb-12 max-w-md mx-auto">
          A simple cycle of giving and receiving
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl">
              1
            </div>
            <h3 className="font-semibold text-lg mb-3">Share a problem</h3>
            <p className="text-secondary leading-relaxed">
              Describe what you&apos;re facing honestly. The more context you give, the better the wisdom you&apos;ll receive.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-highlight to-highlight-light rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl">
              2
            </div>
            <h3 className="font-semibold text-lg mb-3">Others contribute</h3>
            <p className="text-secondary leading-relaxed">
              Strangers share their thoughts anonymously. You&apos;ll never see individual responses - they join a pool.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-light to-warning rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl">
              3
            </div>
            <h3 className="font-semibold text-lg mb-3">Receive synthesis</h3>
            <p className="text-secondary leading-relaxed">
              AI weaves contributions into themes, common advice, and different perspectives. Wisdom, not opinions.
            </p>
          </div>
        </div>
      </div>

      {/* What makes this different */}
      <div className="bg-gradient-to-br from-accent to-accent-dark rounded-3xl p-10 mb-16">
        <h2 className="text-2xl font-semibold mb-3 text-center">
          This is different
        </h2>
        <p className="text-secondary text-center mb-10 max-w-md mx-auto">
          Designed to help, not to engage
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-primary text-lg">✦</span>
            </div>
            <div>
              <p className="font-medium mb-1">No individual responses shown</p>
              <p className="text-secondary text-sm">Contributions join a collective pool - you see the synthesis, not the parts</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-highlight text-lg">✦</span>
            </div>
            <div>
              <p className="font-medium mb-1">No likes or followers</p>
              <p className="text-secondary text-sm">You can&apos;t build an audience here - this isn&apos;t social media</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-primary text-lg">✦</span>
            </div>
            <div>
              <p className="font-medium mb-1">No endless notifications</p>
              <p className="text-secondary text-sm">Just one: &quot;your synthesis is ready&quot;</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-highlight text-lg">✦</span>
            </div>
            <div>
              <p className="font-medium mb-1">Ego-free by design</p>
              <p className="text-secondary text-sm">You can&apos;t point to &quot;your&quot; advice - it&apos;s all woven together</p>
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="mb-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-semibold mb-4">The philosophy</h2>
          <p className="text-secondary leading-relaxed">
            Why we built something different
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl p-8 border border-border">
            <h3 className="text-lg font-semibold mb-4 text-primary">The problem with advice online</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Most online advice is performance. People write for likes, upvotes, and followers.
              The loudest voices win, not the wisest. And you&apos;re left sorting through a dozen
              conflicting opinions, unsure which to trust.
            </p>
            <p className="text-secondary leading-relaxed">
              Even well-meaning advice can feel overwhelming when it comes from individuals
              competing for your attention.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-border">
            <h3 className="text-lg font-semibold mb-4 text-highlight">What if advice had no ego?</h3>
            <p className="text-secondary leading-relaxed mb-4">
              We asked: what if contributors couldn&apos;t build a following? What if you couldn&apos;t
              see who said what? What if the only thing that mattered was whether the
              collective wisdom actually helped?
            </p>
            <p className="text-secondary leading-relaxed">
              When people contribute anonymously to a synthesis, they write differently.
              More honestly. More thoughtfully. Less performatively.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-accent rounded-3xl p-10 border border-border">
          <h3 className="text-xl font-semibold mb-6 text-center">How synthesis works</h3>
          <div className="max-w-2xl mx-auto space-y-6 text-secondary leading-relaxed">
            <p>
              When you share a problem, it goes to other members of the community. They read your
              situation and offer their thoughts - what they&apos;d consider, what worked in similar
              situations, what to watch out for.
            </p>
            <p>
              But here&apos;s the key: <strong className="text-foreground">you never see these individual responses</strong>.
              Instead, once enough people have contributed, AI synthesises everything into something more useful
              than any single response could be.
            </p>
            <p>
              The synthesis identifies <strong className="text-foreground">common themes</strong> (what multiple people agreed on),
              <strong className="text-foreground"> divergent views</strong> (where people disagreed and why both perspectives matter),
              <strong className="text-foreground"> key considerations</strong> (things you might not have thought about),
              and <strong className="text-foreground">cautions</strong> (warnings people raised).
            </p>
            <p>
              The result is something that feels less like &quot;advice from strangers&quot; and more like
              distilled wisdom from people who took time to think about your specific situation.
            </p>
          </div>
        </div>
      </div>

      {/* Community Values */}
      <div className="mb-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Built on trust</h2>
        <p className="text-secondary mb-10 max-w-lg mx-auto">
          This only works if people contribute thoughtfully. That&apos;s why everyone who joins
          commits to these principles:
        </p>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-accent rounded-2xl p-6">
            <p className="font-medium mb-2">Contribute kindly</p>
            <p className="text-secondary text-sm">
              Real people read your words. Offer what you genuinely believe might help.
            </p>
          </div>
          <div className="bg-accent rounded-2xl p-6">
            <p className="font-medium mb-2">Let go of ownership</p>
            <p className="text-secondary text-sm">
              Your contribution joins others. You won&apos;t be able to point to &quot;your&quot; advice.
            </p>
          </div>
          <div className="bg-accent rounded-2xl p-6">
            <p className="font-medium mb-2">Help without performing</p>
            <p className="text-secondary text-sm">
              No audience to impress. No reputation to build. Just strangers helping strangers.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8 mb-8">
        <p className="text-xl text-foreground mb-3">Ready to give and receive wisdom?</p>
        <p className="text-secondary mb-8 max-w-md mx-auto">
          Join a community of people helping each other through life&apos;s challenges,
          without the noise of social media.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all font-medium text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Join the community
        </Link>
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
    <div className="py-8 animate-fade-in">
      <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
      <p className="text-secondary mb-10">What would you like to do today?</p>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/contribute"
          className="block p-8 bg-white border border-border rounded-3xl hover:border-highlight hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-highlight/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-highlight/20 transition-colors">
            <span className="text-2xl">💭</span>
          </div>
          <h2 className="text-xl font-medium mb-2 group-hover:text-highlight">
            Help others
          </h2>
          <p className="text-secondary">
            Share your thoughts on problems others are facing
          </p>
        </Link>

        <Link
          href="/submit"
          className="block p-8 bg-white border border-border rounded-3xl hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-xl font-medium mb-2 group-hover:text-primary">
            Share a problem
          </h2>
          <p className="text-secondary">
            Get collective wisdom on something you&apos;re facing
          </p>
        </Link>
      </div>

      {/* Stats - understated but warm */}
      {profile && (
        <div className="flex gap-6 mb-12">
          <div className="px-5 py-3 bg-accent rounded-2xl">
            <p className="text-sm text-secondary">Problems shared</p>
            <p className="text-2xl font-semibold text-primary">{profile.problems_submitted}</p>
          </div>
          <div className="px-5 py-3 bg-accent rounded-2xl">
            <p className="text-sm text-secondary">Contributions</p>
            <p className="text-2xl font-semibold text-highlight">{profile.contributions_count}</p>
          </div>
        </div>
      )}

      {/* Syntheses ready */}
      {completedProblems && completedProblems.length > 0 && (
        <div>
          <h2 className="text-xl font-medium mb-4">Syntheses ready</h2>
          <div className="space-y-3">
            {completedProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.id}/synthesis`}
                className="block p-5 bg-white border border-border rounded-2xl hover:border-success hover:shadow-sm transition-all"
              >
                <p className="font-medium mb-1">{problem.title}</p>
                <p className="text-sm text-success flex items-center gap-2">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Synthesis ready to view
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/my-problems"
            className="inline-block mt-6 text-primary hover:text-primary-dark font-medium"
          >
            View all your problems →
          </Link>
        </div>
      )}
    </div>
  )
}
