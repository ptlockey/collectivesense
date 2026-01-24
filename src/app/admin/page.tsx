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
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  console.log('Admin check:', { userId: user.id, profile, profileError })

  if (!profile?.is_admin) {
    console.log('Not admin, redirecting. Profile:', profile)
    redirect('/')
  }

  // Fetch all data for admin
  const { data: problems } = await supabase
    .from('problems')
    .select('*, profiles(id), categories(name)')
    .order('created_at', { ascending: false })

  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, is_admin, contributions_count, problems_submitted, created_at')
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
