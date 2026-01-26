'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Problem {
  id: string
  title: string
  status: string
  contribution_count: number
  contribution_threshold: number
  created_at: string
  categories: { name: string } | null
}

interface User {
  id: string
  email: string | null
  display_name: string | null
  is_admin: boolean
  contributions_count: number
  problems_submitted: number
  created_at: string
}

interface AdminDashboardProps {
  problems: Problem[]
  users: User[]
}

export function AdminDashboard({ problems: initialProblems, users: initialUsers }: AdminDashboardProps) {
  const [problems, setProblems] = useState(initialProblems)
  const [users, setUsers] = useState(initialUsers)
  const [activeTab, setActiveTab] = useState<'problems' | 'users'>('problems')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [synthesising, setSynthesising] = useState<string | null>(null)

  const triggerSynthesis = async (id: string) => {
    if (!confirm('Trigger synthesis for this problem? This will generate the collective wisdom from all contributions.')) {
      return
    }

    setSynthesising(id)

    try {
      const response = await fetch(`/api/synthesise/${id}`, {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok) {
        // Update local state to reflect the change
        setProblems(problems.map(p =>
          p.id === id ? { ...p, status: 'complete' } : p
        ))
        alert('Synthesis complete!')
      } else {
        alert('Synthesis failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Synthesis failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    setSynthesising(null)
  }

  const deleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem? This will also delete all contributions and syntheses.')) {
      return
    }

    setDeleting(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', id)

    if (!error) {
      setProblems(problems.filter(p => p.id !== id))
    } else {
      alert('Failed to delete: ' + error.message)
    }

    setDeleting(null)
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their problems and contributions.')) {
      return
    }

    setDeleting(id)
    const supabase = createClient()

    // Delete profile (cascades to problems, contributions)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (!error) {
      setUsers(users.filter(u => u.id !== id))
    } else {
      alert('Failed to delete: ' + error.message)
    }

    setDeleting(null)
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'problems'
              ? 'bg-primary text-white'
              : 'bg-accent text-foreground hover:bg-accent-dark'
          }`}
        >
          Problems ({problems.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-primary text-white'
              : 'bg-accent text-foreground hover:bg-accent-dark'
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* Problems Tab */}
      {activeTab === 'problems' && (
        <div className="space-y-3">
          {problems.length === 0 ? (
            <p className="text-secondary py-8 text-center">No problems yet</p>
          ) : (
            problems.map((problem) => (
              <div
                key={problem.id}
                className="bg-white border border-border rounded-2xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{problem.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-secondary mt-1">
                    <span>{problem.categories?.name || 'Uncategorized'}</span>
                    <span className={problem.status === 'complete' ? 'text-green-600' : problem.status === 'gathering' ? 'text-amber-600' : ''}>
                      Status: {problem.status}
                    </span>
                    <span>{problem.contribution_count}/{problem.contribution_threshold} contributions</span>
                    <span>{new Date(problem.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {problem.status === 'gathering' && (
                    <button
                      onClick={() => triggerSynthesis(problem.id)}
                      disabled={synthesising === problem.id}
                      className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {synthesising === problem.id ? 'Synthesising...' : 'Synthesise'}
                    </button>
                  )}
                  <button
                    onClick={() => deleteProblem(problem.id)}
                    disabled={deleting === problem.id}
                    className="px-3 py-1.5 text-sm bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors disabled:opacity-50"
                  >
                    {deleting === problem.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-secondary py-8 text-center">No users yet</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-border rounded-2xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {user.display_name || user.email || `User ${user.id.slice(0, 8)}...`}
                    </p>
                    {user.is_admin && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-secondary mt-1">
                    <span>{user.problems_submitted} problems</span>
                    <span>{user.contributions_count} contributions</span>
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {!user.is_admin && (
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={deleting === user.id}
                    className="px-3 py-1.5 text-sm bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors disabled:opacity-50"
                  >
                    {deleting === user.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
