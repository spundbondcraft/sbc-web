'use client'
import { useEffect, useState } from 'react'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import { Receipt, ExternalLink } from 'lucide-react'
import type { Order } from '@/lib/db/schema'

export default function AdminKwitansiPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        const filtered = (Array.isArray(data) ? data : []).filter((o: Order) => {
          const payments = Array.isArray(o.payments) ? o.payments as any[] : []
          return payments.length > 0
        })
        setOrders(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const generate = async (orderId: string) => {
    setGenerating(orderId)
    const res = await fetch(`/api/documents/kwitansi/${orderId}`, { method: 'POST' })
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
    setGenerating(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Kwitansi</h1>
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Generate kwitansi untuk order yang sudah ada angsuran
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: '#E5E7EB', borderTopColor: '#E8470A' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>
              Belum ada order dengan angsuran
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F9FAF6', borderBottom: '1px solid #E5E7EB' }}>
                {['Kode', 'Klien', 'Total', 'Terbayar', 'Sisa', 'Kwitansi', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-montserrat text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const payments = Array.isArray(order.payments) ? order.payments as any[] : []
                const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0)
                const sp = Number(order.sellingPrice ?? 0)
                const sisa = Math.max(0, sp - totalPaid)
                return (
                  <tr key={order.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #F9FAF6' }}>
                    <td className="px-4 py-3 font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                      {order.codeFixed ?? order.codePra}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>{order.clientName}</td>
                    <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>
                      {sp > 0 ? formatRupiah(sp) : '—'}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm" style={{ color: '#7AB611' }}>
                      {formatRupiah(totalPaid)}
                    </td>
                    <td className="px-4 py-3 font-montserrat font-semibold text-sm" style={{ color: sisa === 0 ? '#7AB611' : '#E8470A' }}>
                      {sisa === 0 ? 'LUNAS' : formatRupiah(sisa)}
                    </td>
                    <td className="px-4 py-3">
                      {order.kwitansiUrl && (
                        <a href={order.kwitansiUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 font-inter text-xs" style={{ color: '#5A8A0A' }}>
                          <ExternalLink size={12} /> Buka
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => generate(order.id)}
                        disabled={generating === order.id}
                        className="flex items-center gap-1 font-inter text-xs font-semibold rounded-lg px-3 py-1.5 disabled:opacity-40"
                        style={{ background: 'rgba(90,138,10,0.1)', color: '#5A8A0A' }}
                      >
                        {generating === order.id
                          ? <span className="animate-spin w-3 h-3 border border-current rounded-full border-t-transparent" />
                          : <><Receipt size={12} /> {order.kwitansiUrl ? 'Regen' : 'Generate'}</>}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
