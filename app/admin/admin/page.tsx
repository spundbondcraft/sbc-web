import { db, orders, notifications } from '@/lib/db'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import { Package, Clock, AlertTriangle, TrendingUp, ArrowRight, Bell } from 'lucide-react'

export default async function AdminDashboard() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt))
  const recentNotifs = await db.select().from(notifications)
    .where(eq(notifications.isRead, false))
    .orderBy(desc(notifications.createdAt))
    .limit(5)

  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Card 1: Order Aktif (status = production)
  const orderAktif = allOrders.filter(o => o.productionStatus === 'production')

  // Card 2: Menunggu DP (phase=fixed, payments=[])
  const menungguDP = allOrders.filter(o => {
    const payments = Array.isArray(o.payments) ? o.payments as any[] : []
    return o.phase === 'fixed' && payments.length === 0
  })

  // Card 3: Deadline Minggu Ini
  const deadlineMingguIni = allOrders.filter(o => {
    if (!o.estimatedDone) return false
    const deadline = new Date(o.estimatedDone)
    return deadline >= now && deadline <= weekFromNow && o.productionStatus !== 'done'
  })

  // Card 4: Pendapatan Bulan Ini (order lunas)
  const pendapatanBulanIni = allOrders
    .filter(o => {
      if (o.productionStatus !== 'done') return false
      const updated = o.updatedAt ? new Date(o.updatedAt) : null
      return updated && updated >= startOfMonth
    })
    .reduce((sum, o) => sum + Number(o.sellingPrice ?? 0), 0)

  const recentOrders = allOrders.slice(0, 8)

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    received:     { bg: '#FEF3C7', text: '#92400E' },
    assessment:   { bg: '#EDE9FE', text: '#5B21B6' },
    confirmed:    { bg: '#DBEAFE', text: '#1E40AF' },
    production:   { bg: '#FED7AA', text: '#C2410C' },
    finishing:    { bg: '#FCE7F3', text: '#9D174D' },
    ready_to_ship:{ bg: '#D1FAE5', text: '#065F46' },
    shipped:      { bg: '#DCFCE7', text: '#166534' },
    done:         { bg: '#F3F4F6', text: '#374151' },
  }

  const STATUS_LABELS: Record<string, string> = {
    received:      'Pra-order Diterima',
    assessment:    'Asesmen',
    confirmed:     'DP Masuk',
    production:    'Sedang Produksi',
    finishing:     'Finishing',
    ready_to_ship: 'Siap Kirim',
    shipped:       'Dikirim',
    done:          'Selesai',
  }

  const metrics = [
    {
      label: 'Order Aktif',
      value: orderAktif.length,
      sub: 'sedang produksi',
      Icon: Package,
      color: '#C2410C',
      bg: '#FED7AA',
    },
    {
      label: 'Menunggu DP',
      value: menungguDP.length,
      sub: 'fixed, belum bayar',
      Icon: Clock,
      color: '#1E40AF',
      bg: '#DBEAFE',
    },
    {
      label: 'Deadline Minggu Ini',
      value: deadlineMingguIni.length,
      sub: 'estimasi dalam 7 hari',
      Icon: AlertTriangle,
      color: '#92400E',
      bg: '#FEF3C7',
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: formatRupiah(pendapatanBulanIni),
      sub: 'dari order lunas',
      Icon: TrendingUp,
      color: '#065F46',
      bg: '#D1FAE5',
      isText: true,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>
          Dashboard
        </h1>
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Overview produksi & keuangan SBC.id
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-5"
            style={{ background: '#fff', border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{m.label}</p>
              <div className="p-1.5 rounded-lg" style={{ background: m.bg }}>
                <m.Icon size={15} style={{ color: m.color }} />
              </div>
            </div>
            <p
              className="font-montserrat font-bold"
              style={{
                fontSize: m.isText ? '15px' : '28px',
                color: '#1A1A1A',
                lineHeight: 1.2,
              }}
            >
              {m.value}
            </p>
            <p className="font-inter text-xs mt-1" style={{ color: '#9CA3AF' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Recent orders */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <h2 className="font-montserrat font-bold text-sm" style={{ color: '#1A1A1A' }}>
              Order Terbaru
            </h2>
            <Link
              href="/admin/orders"
              className="font-inter text-xs flex items-center gap-1"
              style={{ color: '#E8470A' }}
            >
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {recentOrders.map((order) => {
              const status = order.productionStatus ?? 'received'
              const sc = STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: '#374151' }
              const phase = order.phase ?? 'pra'
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid #F9FAF6' }}
                >
                  <div className="flex items-center gap-3">
                    {/* Phase badge */}
                    <span
                      className="font-inter text-xs px-2 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: phase === 'fixed' ? '#DCFCE7' : '#EDE9FE',
                        color: phase === 'fixed' ? '#166534' : '#5B21B6',
                      }}
                    >
                      {phase === 'fixed' ? 'Fixed' : 'PRA'}
                    </span>
                    <div>
                      <p className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                        {order.codeFixed ?? order.codePra}
                      </p>
                      <p className="font-inter text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        {order.clientName} · {order.qty} pcs
                      </p>
                    </div>
                  </div>
                  <span
                    className="font-inter text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {STATUS_LABELS[status] ?? status}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Notifikasi */}
        <div className="rounded-xl" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <Bell size={16} style={{ color: '#E8470A' }} />
            <h2 className="font-montserrat font-bold text-sm" style={{ color: '#1A1A1A' }}>
              Notifikasi ({recentNotifs.length})
            </h2>
          </div>
          <div className="px-5 py-4">
            {recentNotifs.length === 0 ? (
              <p className="font-inter text-sm text-center py-6" style={{ color: '#9CA3AF' }}>
                Tidak ada notifikasi baru
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentNotifs.map(n => (
                  <div key={n.id} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: '#E8470A' }}
                    />
                    <div>
                      <p className="font-inter text-sm" style={{ color: '#374151' }}>
                        {n.message}
                      </p>
                      <p className="font-inter text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        {new Date(n.createdAt!).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
