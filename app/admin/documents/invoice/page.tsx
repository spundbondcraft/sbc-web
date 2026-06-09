'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import { FileText, ExternalLink, RefreshCw } from 'lucide-react'
import type { Order } from '@/lib/db/schema'

export default function AdminInvoicePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders?phase=fixed')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const generate = async (orderId: string) => {
    setGenerating(orderId)
    const res = await fetch(`/api/documents/invoice/${orderId}`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packagingFee: 0 }),
    })
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
    // Refresh
    fetch('/api/orders?phase=fixed').then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : []))
    setGenerating(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Invoice</h1>
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Generate & kelola invoice untuk semua order Fixed
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: '#E5E7EB', borderTopColor: '#E8470A' }} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F9FAF6', borderBottom: '1px solid #E5E7EB' }}>
                {['Kode', 'Klien', 'Invoice No', 'Harga', 'Status', 'Dokumen', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-montserrat text-xs font-semibold" style={{ color: '#6B7280' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #F9FAF6' }}>
                  <td className="px-4 py-3">
                    <p className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                      {order.codeFixed}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>{order.clientName}</td>
                  <td className="px-4 py-3 font-inter text-xs" style={{ color: '#9CA3AF' }}>
                    {order.invoiceNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>
                    {order.sellingPrice ? formatRupiah(Number(order.sellingPrice)) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-inter text-xs px-2 py-1 rounded-full"
                      style={{
                        background: order.invoiceUrl ? 'rgba(122,182,17,0.1)' : 'rgba(156,163,175,0.1)',
                        color: order.invoiceUrl ? '#5A8A0A' : '#9CA3AF',
                      }}
                    >
                      {order.invoiceUrl ? 'Sudah' : 'Belum'} digenerate
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.invoiceUrl && (
                      <a
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-inter text-xs"
                        style={{ color: '#E8470A' }}
                      >
                        <ExternalLink size={12} /> Buka
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => generate(order.id)}
                      disabled={generating === order.id}
                      className="flex items-center gap-1 font-inter text-xs font-semibold rounded-lg px-3 py-1.5 transition-opacity disabled:opacity-40"
                      style={{ background: 'rgba(232,71,10,0.1)', color: '#E8470A' }}
                    >
                      {generating === order.id
                        ? <span className="animate-spin w-3 h-3 border border-current rounded-full border-t-transparent" />
                        : <><FileText size={12} /> {order.invoiceUrl ? 'Regen' : 'Generate'}</>}
                    </button>
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
