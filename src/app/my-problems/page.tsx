import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE, demoProblems } from '@/lib/demo-data'
import { formatRelativeTime, getStatusLabel, getProgressPercentage } from '@/lib/utils'

export default async function MyProblemsPage() {
  let problems: typeof demoProblems = []

  if (DEMO_MODE) {
    problems = demoProblems
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data } = await supabase
      .from('problems')
      .select('*, categories(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    problems = (data || []) as typeof demoProblems
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Problems</h1>
        <Link
          href="/submit"
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
        >
          Share a problem
        </Link>
      </div>

      {problems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-secondary mb-4">You haven&apos;t shared any problems yet.</p>
          <Link
            href="/submit"
            className="text-primary hover:text-primary-dark"
          >
            Share your first problem
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs text-secondary">
                    {problem.categories?.name}
                  </span>
                  <h2 className="font-medium mt-1">{problem.title}</h2>
                </div>
                <span className="text-xs text-secondary whitespace-nowrap">
                  {formatRelativeTime(problem.created_at)}
                </span>
              </div>

              <div className="mt-4">
                {problem.status === 'gathering' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-secondary">
                        {getStatusLabel(problem.status)}
                      </span>
                      <span className="text-secondary">
                        {problem.contribution_count}/{problem.contribution_threshold}
                      </span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${getProgressPercentage(
                            problem.contribution_count,
                            problem.contribution_threshold
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {problem.status === 'synthesising' && (
                  <p className="text-sm text-warning">
                    Creating synthesis...
                  </p>
                )}

                {problem.status === 'complete' && (
                  <Link
                    href={`/problems/${problem.id}/synthesis`}
                    className="inline-block text-sm text-success hover:text-success/80"
                  >
                    View synthesis
                  </Link>
                )}

                {problem.status === 'closed' && (
                  <p className="text-sm text-secondary">Closed</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
