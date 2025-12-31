import { AdminSidebar } from '@/components/admin/sidebar'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  const role = await getUserRole(user.id)

  // Only admin and staff can access admin panel
  if (role !== 'admin' && role !== 'staff') {
    redirect('/login?error=unauthorized')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar userRole={role as 'admin' | 'staff'} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
