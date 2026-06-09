'use client'
import { useEffect, useState } from 'react'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import type { Order } from '@/lib/db/schema'

interface Summary { totalRevenue: number; totalCogs: number; totalProfit: number }

export default function AdminFinancePage() {
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [data, setData] = useState<{ orders: Order[]; summary: Summary } | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchData = async (m: string) => {
    setLoading(true)
    const res = await fetch(`/api/finance?month=${m}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchData(month) }, [month])

  const exportXlsx = async () => {
    setExporting(true)
    const res = await fetch(`/api/finance?month=${month}&export=true`)
    const json = await res.json()

    // Dynamic import xlsx for client-side generation
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(json.orders.map((o: any) => ({
      'Kode Order': o.kode,
      'Nama Klien': o.klien,
      'Tanggal': o.tanggal ? new Date(o.tanggal).toLocaleDateString('id-ID') : '',
      'Pendapatan': Number(o.pendapatan),
      'COGS': Number(o.cogs),
      'Profit': Number(o.profit),
    })))

    // Summary row
    XLSX.utils.sheet_add_aoa(ws, [
      [],
      ['', '', 'TOTAL', json.summary.totalRevenue, json.summary.totalCogs, json.summary.totalProfit],
    ], { origin: -1 })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `Finance ${month}`)
    XLSX.writeFile(wb, `SBC_Finance_${month}.xlsx`)
    setExporting(false)
  }

  const margin = data?.summary
    ? data.summary.totalRevenue > 0
      ? ((data.summary.totalProfit / data.summary.totalRevenue) * 100).toFixed(1)
      : '0'
    : '0'

  const cardStyle = { background: '#fff', border: '1px solid #E5E7EB' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Keuangan</h1>
          <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Rekap pendapatan & profit per bulan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="font-inter text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
          />
          <button
            onClick={exportXlsx}
            disabled={exporting || !data?.orders.length}
            className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-xl px-4 py-2.5 disabled:opacity-40"
            style={{ background: '#5A8A0A' }}
          >
            {exporting
              ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              : <><Download size={15} /> Export XLSX</>}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Pendapatan',
              value: formatRupiah(data.summary.totalRevenue),
              Icon: DollarSign,
              color: '#1A1A1A',
              bg: '#F9FAF6',
            },
            {
              label: 'Total COGS',
              value: formatRupiah(data.summary.totalCogs),
              Icon: TrendingDown,
              color: '#E8470A',
              bg: '#FEF2EB',
            },
            {
              label: 'Total Profit',
              value: formatRupiah(data.summary.totalProfit),
              Icon: TrendingUp,
              color: '#7AB611',
              bg: '#F0F9E0',
            },
            {
              label: 'Margin',
              value: `${margin}%`,
              Icon: BarChart3,
              color: '#5A8A0A',
              bg: '#F0F9E0',
            },
          ].map((card) => (
            <div key={card.label} className="rounded-xl p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{card.label}</p>
                <div className="p-1.5 rounded-lg" style={{ background: card.bg }}>
                  <card.Icon size={15} style={{ color: card.color }} />
                </div>
              </div>
              <p className="font-montserrat font-bold" style={{ fontSize: '18px', color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Bar chart — visual dengan CSS */}
      {data && data.orders.length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={cardStyle}>
          <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
            Distribusi Order — {month}
          </h3>
          <div className="space-y-2">
            {data.orders.slice(0, 10).map((order: any) => {
              const sp = Number(order.sellingPrice ?? 0)
              const maxVal = Math.max(...data.orders.map((o: any) => Number(o.sellingPrice ?? 0)))
              const pct = maxVal > 0 ? (sp / maxVal) * 100 : 0
              return (
                <div key={order.id} className="flex items-center gap-3">
                  <p className="font-inter text-xs w-24 flex-shrink-0" style={{ color: '#6B7280' }}>
                    {(order.codeFixed ?? order.codePra ?? '').slice(-6)}
                  </p>
                  <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{ width: `${pct}%`, background: '#E8470A' }}
                    />
                  </div>
                  <p className="font-inter text-xs w-28 text-right flex-shrink-0" style={{ color: '#374151' }}>
                    {formatRupiah(sp)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h3 className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
            Detail Order Selesai — {month}
          </h3>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin w-8 h-8 border-2 rounded-full"
              style={{ borderColor: '#E5E7EB', borderTopColor: '#E8470A' }} />
          </div>
        ) : !data || data.orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>
              Tidak ada order selesai di bulan ini
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F9FAF6', borderBottom: '1px solid #E5E7EB' }}>
                {['Kode', 'Klien', 'Qty', 'Pendapatan', 'COGS', 'Profit', 'Margin'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-montserrat text-xs font-semibold"
                    style={{ color: '#6B7280' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order: any) => {
                const sp = Number(order.sellingPrice ?? 0)
                const cogs = Number(order.cogsTotal ?? 0)
                const profit = sp - cogs
                const m = sp > 0 ? ((profit / sp) * 100).toFixed(0) : '—'
                return (
                  <tr key={order.id} className="hover:bg-gray-50"
                    style={{ borderBottom: '1px solid #F9FAF6' }}>
                    <td className="px-4 py-3 font-montserrat font-semibold text-sm"
                      style={{ color: '#1A1A1A' }}>
                      {order.codeFixed ?? order.codePra}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>
                      {order.clientName}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm" style={{ color: '#374151' }}>
                      {order.qty} pcs
                    </td>
                    <td className="px-4 py-3 font-inter text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                      {formatRupiah(sp)}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm" style={{ color: '#E8470A' }}>
                      {cogs > 0 ? formatRupiah(cogs) : '—'}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm font-semibold"
                      style={{ color: profit > 0 ? '#7AB611' : '#E8470A' }}>
                      {formatRupiah(profit)}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm" style={{ color: '#9CA3AF' }}>
                      {m}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Footer total */}
            <tfoot>
              <tr style={{ background: '#F9FAF6', borderTop: '2px solid #E5E7EB' }}>
                <td colSpan={3} className="px-4 py-3 font-montserrat font-bold text-sm"
                  style={{ color: '#1A1A1A' }}>TOTAL</td>
                <td className="px-4 py-3 font-montserrat font-bold text-sm" style={{ color: '#1A1A1A' }}>
                  {formatRupiah(data.summary.totalRevenue)}
                </td>
                <td className="px-4 py-3 font-montserrat font-bold text-sm" style={{ color: '#E8470A' }}>
                  {formatRupiah(data.summary.totalCogs)}
                </td>
                <td className="px-4 py-3 font-montserrat font-bold text-sm" style={{ color: '#7AB611' }}>
                  {formatRupiah(data.summary.totalProfit)}
                </td>
                <td className="px-4 py-3 font-montserrat font-bold text-sm" style={{ color: '#5A8A0A' }}>
                  {margin}%
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
