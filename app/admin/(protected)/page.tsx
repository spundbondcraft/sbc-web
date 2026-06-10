import { db, orders, notifications, portfolio } from '@/lib/db'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import {
  ShoppingBag, CheckCircle, Clock,
  TrendingUp, Bell, ArrowRight
} from 'lucide-react'

export default async function AdminDashboard() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt))
  const recentNotifs = await db.select().from(notifications)
    .where(eq(notifications.isRead, false))
    .orderBy(desc(notifications.createdAt))
    .limit(5)

  const activeOrders = allOrders.filter(o =>
    !['done', 'shipped'].includes(o.productionStatus ?? '')
  )
  const doneOrders = allOrders.filter(o => o.productionStatus === 'done')
  const totalRevenue = doneOrders.reduce((s, o) => s + Number(o.sellingPrice ?? 0), 0)
  const recentOrders = allOrders.slice(0, 6)

  const STATUS_COLORS: Record<string, string> = {
    received: '#9CA3AF',
    assessment: '#F59E0B',
    confirmed: '#3B82F6',
    production: '#E8470A',
    finishing: '#8B5CF6',
    ready_to_ship: '#7AB611',
    shipped: '#5A8A0A',
    done: '#7AB611',
  }

  const STATUS_LABELS: Record<string, string> = {
    received: 'Diterima', assessment: 'Asesmen', confirmed: 'Confirmed',
    production: 'Produksi', finishing: 'Finishing',
    ready_to_ship: 'Siap Kirim', shipped: 'Dikirim', done: 'Selesai',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Dashboard</h1>
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Overview produksi & keuangan SBC.id
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Order', value: allOrders.length, Icon: ShoppingBag, color: '#E8470A' },
          { label: 'Aktif', value: activeOrders.length, Icon: Clock, color: '#F59E0B' },
          { label: 'Selesai', value: doneOrders.length, Icon: CheckCircle, color: '#7AB611' },
          { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), Icon: TrendingUp, color: '#5A8A0A', text: true },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5"
            style={{ background: '#fff', border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{card.label}</p>
              <card.Icon size={18} style={{ color: card.color }} />
            </div>
            <p
              className="font-montserrat font-bold"
              style={{ fontSize: card.text ? '16px' : '28px', color: '#1A1A1A' }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Recent orders */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #E5E7EB' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
            <h2 className="font-montserrat font-bold text-sm" style={{ color: '#1A1A1A' }}>Order Terbaru</h2>
            <Link href="/admin/orders" className="font-inter text-xs flex items-center gap-1" style={{ color: '#E8470A' }}>
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                style={{ borderBottom: '1px solid #F9FAF6' }}
              >
                <div>
                  <p className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                    {order.codeFixed ?? order.codePra}
                  </p>
                  <p className="font-inter text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    {order.clientName} · {order.qty} pcs
                  </p>
                </div>
                <span
                  className="font-inter text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: `${STATUS_COLORS[order.productionStatus ?? 'received']}22`,
                    color: STATUS_COLORS[order.productionStatus ?? 'received'],
                  }}
                >
                  {STATUS_LABELS[order.productionStatus ?? 'received']}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div
          className="rounded-xl"
          style={{ background: '#fff', border: '1px solid #E5E7EB' }}
        >
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
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
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#E8470A' }} />
                    <div>
                      <p className="font-inter text-sm" style={{ color: '#374151' }}>{n.message}</p>
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
