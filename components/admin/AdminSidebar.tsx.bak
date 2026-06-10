'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, ShoppingBag, Calculator,
  FileText, Image, BarChart3, Settings, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/admin/cogs', label: 'COGS Config', Icon: Calculator },
  { href: '/admin/documents/invoice', label: 'Invoice', Icon: FileText },
  { href: '/admin/documents/kwitansi', label: 'Kwitansi', Icon: FileText },
  { href: '/admin/portfolio', label: 'Portfolio', Icon: Image },
  { href: '/admin/finance', label: 'Keuangan', Icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40"
      style={{ background: '#0D1F00' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="font-montserrat font-bold text-white text-lg">SBC.id</span>
          <span
            className="font-inter text-xs px-2 py-0.5 rounded"
            style={{ background: 'rgba(232,71,10,0.2)', color: '#E8470A' }}
          >
            Admin
          </span>
        </div>
        <p className="font-inter text-xs mt-1" style={{ color: '#6B7280' }}>Internal Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {navItems.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-inter text-sm transition-all"
                style={{
                  background: active ? 'rgba(232,71,10,0.15)' : 'transparent',
                  color: active ? '#E8470A' : '#9CA3AF',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-inter text-sm w-full transition-colors"
          style={{ color: '#6B7280' }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
