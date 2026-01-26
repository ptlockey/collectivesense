import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // Fetch all data for admin
  const { data: problems } = await supabase
    .from('problems')
    .select('id, title, status, contribution_count, contribution_threshold, created_at, categories(name)')
    .order('created_at', { ascending: false })

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, is_admin, contributions_count, problems_submitted, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
      <p className="text-secondary mb-8">Manage problems and users</p>

      <AdminDashboard
        problems={problems || []}
        users={users || []}
      />
    </div>
  )
}
