'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import type { Order } from '@/lib/db/schema'

const STATUS_COLORS: Record<string, string> = {
  received: '#9CA3AF', assessment: '#F59E0B', confirmed: '#3B82F6',
  production: '#E8470A', finishing: '#8B5CF6',
  ready_to_ship: '#7AB611', shipped: '#5A8A0A', done: '#7AB611',
}
const STATUS_LABELS: Record<string, string> = {
  received: 'Diterima', assessment: 'Asesmen', confirmed: 'Confirmed',
  production: 'Produksi', finishing: 'Finishing',
  ready_to_ship: 'Siap Kirim', shipped: 'Dikirim', done: 'Selesai',
}
const STATUSES = Object.keys(STATUS_LABELS)

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [phaseFilter, setPhaseFilter] = useState('all')

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch =
      (o.codeFixed ?? o.codePra ?? '').toLowerCase().includes(search.toLowerCase()) ||
      o.clientName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.productionStatus === statusFilter
    const matchPhase = phaseFilter === 'all' || o.phase === phaseFilter
    return matchSearch && matchStatus && matchPhase
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Orders</h1>
          <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
            {orders.length} total order
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-xl px-4 py-2.5 transition-transform hover:scale-105"
          style={{ background: '#E8470A' }}
        >
          <Plus size={16} />
          Order Baru
        </Link>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 mb-4 flex flex-wrap gap-3"
        style={{ background: '#fff', border: '1px solid #E5E7EB' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari kode atau nama klien..."
            className="w-full pl-9 pr-4 py-2 rounded-lg font-inter text-sm outline-none"
            style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
          />
        </div>

        {/* Phase */}
        <select
          value={phaseFilter}
          onChange={e => setPhaseFilter(e.target.value)}
          className="font-inter text-sm rounded-lg px-3 py-2 outline-none"
          style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
        >
          <option value="all">Semua Fase</option>
          <option value="pra">PRA</option>
          <option value="fixed">Fixed</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="font-inter text-sm rounded-lg px-3 py-2 outline-none"
          style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
        >
          <option value="all">Semua Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-8 h-8 border-2 rounded-full mx-auto mb-3"
              style={{ borderColor: '#E5E7EB', borderTopColor: '#E8470A' }} />
            <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>Tidak ada order ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAF6' }}>
                {['Kode', 'Klien', 'Model', 'Qty', 'Fase', 'Status', 'Harga', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-montserrat font-semibold text-xs"
                    style={{ color: '#6B7280', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid #F9FAF6' }}
                >
                  <td className="px-4 py-3">
                    <p className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                      {order.codeFixed ?? order.codePra}
                    </p>
                    {order.phase === 'fixed' && (
                      <span className="font-inter text-xs" style={{ color: '#7AB611' }}>Fixed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-inter text-sm" style={{ color: '#374151' }}>{order.clientName}</p>
                    {order.companyName && (
                      <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{order.companyName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>
                    {order.bagModel}
                  </td>
                  <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>
                    {order.qty} pcs
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-inter text-xs px-2 py-0.5 rounded"
                      style={{
                        background: order.phase === 'fixed' ? 'rgba(122,182,17,0.15)' : 'rgba(232,71,10,0.1)',
                        color: order.phase === 'fixed' ? '#5A8A0A' : '#E8470A',
                      }}
                    >
                      {order.phase?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-inter text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: `${STATUS_COLORS[order.productionStatus ?? 'received']}22`,
                        color: STATUS_COLORS[order.productionStatus ?? 'received'],
                      }}
                    >
                      {STATUS_LABELS[order.productionStatus ?? 'received']}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>
                    {order.sellingPrice ? `Rp ${Number(order.sellingPrice).toLocaleString('id-ID')}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-inter text-xs font-semibold transition-colors"
                      style={{ color: '#E8470A' }}
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
