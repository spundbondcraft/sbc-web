'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import {
  ArrowLeft, FileText, Receipt, Upload, CheckCircle,
  Plus, ChevronDown, Save, ExternalLink
} from 'lucide-react'
import type { Order } from '@/lib/db/schema'

const STATUSES = [
  { key: 'received', label: 'Diterima' },
  { key: 'assessment', label: 'Asesmen' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'production', label: 'Produksi' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'ready_to_ship', label: 'Siap Kirim' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'done', label: 'Selesai' },
]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'detail' | 'payment' | 'internal'>('detail')

  // Payment form
  const [payAmount, setPayAmount] = useState('')
  const [payDesc, setPayDesc] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [savingPay, setSavingPay] = useState(false)

  // Status
  const [savingStatus, setSavingStatus] = useState(false)

  // Internal notes
  const [internalNotes, setInternalNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Documents
  const [genInvoice, setGenInvoice] = useState(false)
  const [genKwitansi, setGenKwitansi] = useState(false)
  const [packagingFee, setPackagingFee] = useState('0')

  // Upgrade PRA → fixed
  const [fixedCode, setFixedCode] = useState('')
  const [upgrading, setUpgrading] = useState(false)
  const [sellingPrice, setSellingPrice] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)

  const fetchOrder = () => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(data => {
        setOrder(data)
        setInternalNotes(data.internalNotes ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() }, [id])

  const updateStatus = async (newStatus: string) => {
    setSavingStatus(true)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productionStatus: newStatus }),
    })
    await fetchOrder()
    setSavingStatus(false)
  }

  const addPayment = async () => {
    if (!payAmount) return
    setSavingPay(true)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment: {
          amount: parseFloat(payAmount.replace(/[^0-9]/g, '')),
          description: payDesc || `Angsuran`,
          date: payDate,
        },
      }),
    })
    setPayAmount(''); setPayDesc('')
    await fetchOrder()
    setSavingPay(false)
  }

  const saveInternalNotes = async () => {
    setSavingNotes(true)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalNotes }),
    })
    setSavingNotes(false)
  }

  const saveSellingPrice = async () => {
    setSavingPrice(true)
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellingPrice: parseFloat(sellingPrice.replace(/[^0-9]/g, '')) }),
    })
    await fetchOrder()
    setSavingPrice(false)
  }

  const generateInvoice = async () => {
    setGenInvoice(true)
    const res = await fetch(`/api/documents/invoice/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packagingFee: parseFloat(packagingFee || '0') }),
    })
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
    await fetchOrder()
    setGenInvoice(false)
  }

  const generateKwitansi = async () => {
    setGenKwitansi(true)
    const res = await fetch(`/api/documents/kwitansi/${id}`, { method: 'POST' })
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
    await fetchOrder()
    setGenKwitansi(false)
  }

  const upgradeToFixed = async () => {
    if (!fixedCode.trim()) return
    setUpgrading(true)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upgrade', codeFixed: fixedCode.trim().toUpperCase() }),
    })
    await fetchOrder()
    setUpgrading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin w-8 h-8 border-2 rounded-full"
        style={{ borderColor: '#E5E7EB', borderTopColor: '#E8470A' }} />
    </div>
  )

  if (!order) return (
    <div className="text-center py-24">
      <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>Order tidak ditemukan.</p>
    </div>
  )

  const payments = Array.isArray(order.payments) ? order.payments as any[] : []
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0)
  const sp = Number(order.sellingPrice ?? 0)
  const sisa = Math.max(0, sp - totalPaid)
  const dpPct = sp > 0 ? Math.round((totalPaid / sp) * 100) : 0

  const cardStyle = { background: '#fff', border: '1px solid #E5E7EB' }
  const sectionTitle = { color: '#1A1A1A', fontSize: '14px' }
  const label = { color: '#9CA3AF', fontSize: '12px' }
  const value = { color: '#374151', fontSize: '14px' }

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link href="/admin/orders" className="inline-flex items-center gap-1 font-inter text-sm mb-5" style={{ color: '#9CA3AF' }}>
        <ArrowLeft size={14} /> Kembali ke daftar
      </Link>

      {/* Header */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="font-montserrat font-bold text-xl" style={{ color: '#1A1A1A' }}>
              {order.codeFixed ?? order.codePra}
            </p>
            <p className="font-inter text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
              {order.clientName}{order.companyName ? ` · ${order.companyName}` : ''} · {order.whatsapp}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="font-inter text-xs px-2 py-1 rounded"
              style={{
                background: order.phase === 'fixed' ? 'rgba(122,182,17,0.12)' : 'rgba(232,71,10,0.1)',
                color: order.phase === 'fixed' ? '#5A8A0A' : '#E8470A',
              }}
            >
              {order.phase?.toUpperCase()}
            </span>
            <a
              href={`/order/${order.codeFixed ?? order.codePra}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inter text-xs flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: '#F3F4F6', color: '#6B7280' }}
            >
              <ExternalLink size={12} /> Client view
            </a>
          </div>
        </div>

        {/* Status selector */}
        <div className="mt-4 flex items-center gap-3">
          <span className="font-inter text-xs" style={label}>Status:</span>
          <select
            value={order.productionStatus ?? 'received'}
            onChange={e => updateStatus(e.target.value)}
            disabled={savingStatus}
            className="font-inter text-sm rounded-lg px-3 py-1.5 outline-none"
            style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
          >
            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          {savingStatus && <span className="animate-spin w-4 h-4 border-2 rounded-full" style={{ borderColor: '#E5E7EB', borderTopColor: '#E8470A' }} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 rounded-xl p-1" style={{ background: '#F3F4F6' }}>
        {(['detail', 'payment', 'internal'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 font-inter text-sm py-2 rounded-lg transition-all capitalize"
            style={{
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1A1A1A' : '#9CA3AF',
              fontWeight: tab === t ? 600 : 400,
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {t === 'detail' ? 'Detail' : t === 'payment' ? 'Pembayaran' : 'Internal'}
          </button>
        ))}
      </div>

      {/* Tab: Detail */}
      {tab === 'detail' && (
        <div className="flex flex-col gap-4">
          {/* Spesifikasi */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <h3 className="font-montserrat font-semibold mb-4" style={sectionTitle}>Spesifikasi</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Model', order.bagModel],
                ['Warna', order.bagColor ?? '—'],
                ['GSM', order.bagGsm ? `${order.bagGsm} gsm` : '—'],
                ['Luas', order.surfaceArea ? `${order.surfaceArea} cm²` : '—'],
                ['Qty', `${order.qty} pcs`],
                ['Handle', order.handleType ?? '—'],
                ['Sablon', order.sablonType ?? '—'],
                ['Ukuran Sablon', order.sablonWidth && order.sablonHeight
                  ? `${order.sablonWidth} × ${order.sablonHeight} cm` : '—'],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="font-inter mb-0.5" style={label}>{l}</p>
                  <p className="font-inter" style={value}>{v}</p>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                <p className="font-inter mb-1" style={label}>Catatan Klien</p>
                <p className="font-inter text-sm" style={{ color: '#374151' }}>{order.notes}</p>
              </div>
            )}
          </div>

          {/* Selling price */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <h3 className="font-montserrat font-semibold mb-3" style={sectionTitle}>Harga Jual</h3>
            {order.sellingPrice ? (
              <p className="font-montserrat font-bold text-xl mb-3" style={{ color: '#7AB611' }}>
                {formatRupiah(Number(order.sellingPrice))}
              </p>
            ) : null}
            <div className="flex gap-2">
              <input
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)}
                placeholder="Masukkan harga jual..."
                className="flex-1 font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
              />
              <button
                onClick={saveSellingPrice}
                disabled={savingPrice || !sellingPrice}
                className="font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40 transition-opacity"
                style={{ background: '#5A8A0A' }}
              >
                {savingPrice ? '...' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* Upgrade PRA → Fixed */}
          {order.phase === 'pra' && (
            <div className="rounded-xl p-5" style={{ ...cardStyle, border: '1.5px solid #E8470A22' }}>
              <h3 className="font-montserrat font-semibold mb-1" style={sectionTitle}>Upgrade ke Fixed</h3>
              <p className="font-inter text-xs mb-3" style={{ color: '#9CA3AF' }}>
                Setelah konfirmasi klien, upgrade dari fase PRA ke Fixed.
              </p>
              <div className="flex gap-2">
                <input
                  value={fixedCode}
                  onChange={e => setFixedCode(e.target.value.toUpperCase())}
                  placeholder="Kode Fixed (mis: SBC-001)"
                  className="flex-1 font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
                />
                <button
                  onClick={upgradeToFixed}
                  disabled={upgrading || !fixedCode.trim()}
                  className="font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40 transition-opacity"
                  style={{ background: '#E8470A' }}
                >
                  {upgrading ? '...' : 'Upgrade'}
                </button>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <h3 className="font-montserrat font-semibold mb-3" style={sectionTitle}>Dokumen</h3>

            <div className="mb-3">
              <p className="font-inter text-xs mb-1.5" style={label}>Packaging fee (tambahan invoice)</p>
              <input
                value={packagingFee}
                onChange={e => setPackagingFee(e.target.value)}
                placeholder="0"
                className="font-inter text-sm rounded-lg px-3 py-2 outline-none w-40"
                style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={generateInvoice}
                disabled={genInvoice}
                className="flex items-center gap-2 font-inter text-sm font-semibold rounded-lg px-4 py-2.5 transition-opacity disabled:opacity-50"
                style={{ background: 'rgba(232,71,10,0.1)', color: '#E8470A', border: '1px solid rgba(232,71,10,0.2)' }}
              >
                <FileText size={15} />
                {genInvoice ? 'Generating...' : order.invoiceUrl ? 'Regenerate Invoice' : 'Generate Invoice'}
              </button>

              <button
                onClick={generateKwitansi}
                disabled={genKwitansi || payments.length === 0}
                className="flex items-center gap-2 font-inter text-sm font-semibold rounded-lg px-4 py-2.5 transition-opacity disabled:opacity-50"
                style={{ background: 'rgba(90,138,10,0.1)', color: '#5A8A0A', border: '1px solid rgba(90,138,10,0.2)' }}
              >
                <Receipt size={15} />
                {genKwitansi ? 'Generating...' : 'Generate Kwitansi'}
              </button>

              {order.invoiceUrl && (
                <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-inter text-xs rounded-lg px-3 py-2"
                  style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}>
                  <ExternalLink size={12} /> Invoice
                </a>
              )}
              {order.kwitansiUrl && (
                <a href={order.kwitansiUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-inter text-xs rounded-lg px-3 py-2"
                  style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}>
                  <ExternalLink size={12} /> Kwitansi
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Payment */}
      {tab === 'payment' && (
        <div className="flex flex-col gap-4">
          {/* Summary */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <h3 className="font-montserrat font-semibold mb-4" style={sectionTitle}>Ringkasan Pembayaran</h3>
            <div className="relative h-2 rounded-full mb-4" style={{ background: '#F3F4F6' }}>
              <div
                className="absolute top-0 left-0 h-2 rounded-full transition-all"
                style={{ width: `${dpPct}%`, background: dpPct >= 100 ? '#7AB611' : '#E8470A' }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { l: 'Total', v: formatRupiah(sp), c: '#1A1A1A' },
                { l: 'Terbayar', v: formatRupiah(totalPaid), c: '#7AB611' },
                { l: 'Sisa', v: sisa > 0 ? formatRupiah(sisa) : 'LUNAS', c: sisa > 0 ? '#E8470A' : '#7AB611' },
              ].map(item => (
                <div key={item.l} className="text-center rounded-lg py-3 px-2" style={{ background: '#F9FAF6' }}>
                  <p className="font-inter text-xs mb-1" style={label}>{item.l}</p>
                  <p className="font-montserrat font-bold text-sm" style={{ color: item.c }}>{item.v}</p>
                </div>
              ))}
            </div>

            {/* History */}
            {payments.map((p: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center rounded-lg px-3 py-2.5 mb-2"
                style={{ background: '#F9FAF6' }}
              >
                <div>
                  <p className="font-inter text-sm" style={{ color: '#374151' }}>{p.description ?? `Angsuran ${i + 1}`}</p>
                  <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{p.date}</p>
                </div>
                <p className="font-montserrat font-semibold text-sm" style={{ color: '#7AB611' }}>
                  {formatRupiah(p.amount)}
                </p>
              </div>
            ))}
          </div>

          {/* Add payment */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <h3 className="font-montserrat font-semibold mb-4" style={sectionTitle}>Tambah Angsuran</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="font-inter text-xs mb-1" style={label}>Jumlah</p>
                <input
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="Rp ..."
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
                />
              </div>
              <div>
                <p className="font-inter text-xs mb-1" style={label}>Tanggal</p>
                <input
                  type="date"
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
                />
              </div>
              <div className="col-span-2">
                <p className="font-inter text-xs mb-1" style={label}>Keterangan</p>
                <input
                  value={payDesc}
                  onChange={e => setPayDesc(e.target.value)}
                  placeholder="DP 50%, Pelunasan, dll"
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
                />
              </div>
            </div>
            <button
              onClick={addPayment}
              disabled={savingPay || !payAmount}
              className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40 transition-opacity"
              style={{ background: '#5A8A0A' }}
            >
              {savingPay ? '...' : <><Plus size={15} /> Tambah</>}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Internal */}
      {tab === 'internal' && (
        <div className="rounded-xl p-5" style={cardStyle}>
          <h3 className="font-montserrat font-semibold mb-3" style={sectionTitle}>Catatan Internal</h3>
          <p className="font-inter text-xs mb-3" style={{ color: '#9CA3AF' }}>
            Tidak terlihat oleh klien
          </p>
          <textarea
            value={internalNotes}
            onChange={e => setInternalNotes(e.target.value)}
            rows={8}
            placeholder="Catatan produksi, permasalahan, dll..."
            className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none mb-3"
            style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A', resize: 'vertical' }}
          />
          <button
            onClick={saveInternalNotes}
            disabled={savingNotes}
            className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40 transition-opacity"
            style={{ background: '#E8470A' }}
          >
            {savingNotes ? '...' : <><Save size={15} /> Simpan</>}
          </button>
        </div>
      )}
    </div>
  )
}
