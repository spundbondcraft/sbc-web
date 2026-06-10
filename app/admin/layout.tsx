import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell'
import { headers } from 'next/headers'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname = headersList.get('x-invoke-path') ?? ''

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="flex min-h-screen" style={{ background: '#F9FAF6' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: '240px' }}>
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}
        >
          <p className="font-inter text-sm" style={{ color: '#6B7280' }}>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
          <AdminNotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
