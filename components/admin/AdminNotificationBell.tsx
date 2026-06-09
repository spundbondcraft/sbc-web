'use client'
import { useEffect, useState, useRef } from 'react'
import { Bell, X } from 'lucide-react'
import { gsap } from 'gsap'
import type { Notification } from '@/lib/db/schema'

export function AdminNotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)

  const unread = notifs.filter(n => !n.isRead).length

  const fetchNotifs = () => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setNotifs(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (unread > 0 && dotRef.current) {
      gsap.fromTo(dotRef.current, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' })
    }
  }, [unread])

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.isRead).map(n => markRead(n.id)))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: '#6B7280' }}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span
            ref={dotRef}
            className="absolute top-1 right-1 w-4 h-4 rounded-full font-inter text-white flex items-center justify-center"
            style={{ background: '#E8470A', fontSize: '10px', fontWeight: 700 }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropRef}
          className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ background: '#fff', border: '1px solid #E5E7EB' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
            <h3 className="font-montserrat font-bold text-sm" style={{ color: '#1A1A1A' }}>Notifikasi</h3>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button onClick={markAllRead} className="font-inter text-xs" style={{ color: '#E8470A' }}>
                  Tandai semua dibaca
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ color: '#9CA3AF' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-center font-inter text-sm py-8" style={{ color: '#9CA3AF' }}>
                Tidak ada notifikasi
              </p>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#F3F4F6', background: n.isRead ? '#fff' : '#FEF9F7' }}
                  onClick={() => !n.isRead && markRead(n.id)}
                >
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#E8470A' }} />
                  )}
                  <div className={n.isRead ? 'ml-5' : ''}>
                    <p className="font-inter text-sm" style={{ color: '#1A1A1A' }}>{n.message}</p>
                    <p className="font-inter text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                      {n.orderCode} · {new Date(n.createdAt!).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
