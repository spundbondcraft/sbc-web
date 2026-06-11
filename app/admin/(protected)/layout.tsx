import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="flex min-h-screen" style={{ background: '#F9FAF6' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: '240px' }}>
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <p className="font-inter text-sm" style={{ color: '#6B7280' }}>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
          <AdminNotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}