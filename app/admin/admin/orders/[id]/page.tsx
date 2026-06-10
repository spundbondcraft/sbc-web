'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import {
  ArrowLeft, FileText, Receipt, ExternalLink,
  Plus, Save, MessageCircle, RefreshCw
} from 'lucide-react'
import type { Order } from '@/lib/db/schema'

const STATUSES = [
  { key: 'received',      label: 'Pra-order Diterima', bg: '#FEF3C7', text: '#92400E' },
  { key: 'assessment',    label: 'Asesmen',             bg: '#EDE9FE', text: '#5B21B6' },
  { key: 'confirmed',     label: 'DP Masuk',            bg: '#DBEAFE', text: '#1E40AF' },
  { key: 'production',    label: 'Sedang Produksi',     bg: '#FED7AA', text: '#C2410C' },
  { key: 'finishing',     label: 'Finishing',           bg: '#FCE7F3', text: '#9D174D' },
  { key: 'ready_to_ship', label: 'Siap Kirim',          bg: '#D1FAE5', text: '#065F46' },
  { key: 'shipped',       label: 'Dikirim',             bg: '#DCFCE7', text: '#166534' },
  { key: 'done',          label: 'Selesai',             bg: '#F3F4F6', text: '#374151' },
]

type Tab = 'spesifikasi' | 'pembayaran' | 'dokumen' | 'internal'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sbc-web-delta.vercel.app'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('spesifikasi')

  // State per tab
  const [savingStatus, setSavingStatus] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payDesc, setPayDesc] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [savingPay, setSavingPay] = useState(false)
  const [internalNotes, setInternalNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [genInvoice, setGenInvoice] = useState(false)
  const [genKwitansi, setGenKwitansi] = useState(false)
  const [packagingFee, setPackagingFee] = useState('0')
  const [fixedCode, setFixedCode] = useState('')
  const [upgrading, setUpgrading] = useState(false)
  const [sellingPrice, setSellingPrice] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)

  // Auto-save internal notes timer
  const autoSaveTimer = useRef<NodeJS.Timeout>()

  const fetchOrder = async () => {
    const res = await fetch(`/api/orders/${id}`)
    const data = await res.json()
    setOrder(data)
    setInternalNotes(data.internalNotes ?? '')
    setSellingPrice(data.sellingPrice ? String(Math.round(Number(data.sellingPrice))) : '')
    setLoading(false)
  }

  useEffect(() => { fetchOrder() }, [id])

  // Auto-save internal notes setiap 30 detik
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (order && internalNotes !== (order.internalNotes ?? '')) {
        saveInternalNotes()
      }
    }, 30_000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [internalNotes])

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
          description: payDesc || 'Angsuran',
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
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
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

  // WA deep link
  const getWALink = () => {
    if (!order) return '#'
    const code = order.codeFixed ?? order.codePra
    const portalUrl = `${appUrl}/order/${code}`
    let msg = ''
    if (order.phase === 'pra') {
      msg = `Halo ${order.clientName}, berikut kode pra-order Anda: *${order.codePra}*\nAkses detail order di: ${portalUrl}`
    } else {
      msg = `Halo ${order.clientName}, order Anda telah dikonfirmasi! Kode: *${order.codeFixed}*\nAkses detail order di: ${portalUrl}`
    }
    return `https://wa.me/${order.whatsapp}?text=${encodeURIComponent(msg)}`
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

  const currentStatus = STATUSES.find(s => s.key === (order.productionStatus ?? 'received'))
  const cardSt = { background: '#fff', border: '1px solid #E5E7EB' }
  const lbl = { color: '#9CA3AF', fontSize: '11px' }
  const val = { color: '#374151', fontSize: '13px' }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'spesifikasi', label: 'Spesifikasi' },
    { key: 'pembayaran', label: 'Pembayaran' },
    { key: 'dokumen', label: 'Dokumen' },
    { key: 'internal', label: 'Catatan Internal' },
  ]

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 font-inter text-sm mb-5" style={{ color: '#9CA3AF' }}>
        <ArrowLeft size={14} /> Kembali
      </Link>

      {/* Header */}
      <div className="rounded-xl p-5 mb-4" style={cardSt}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-montserrat font-bold text-xl" style={{ color: '#1A1A1A' }}>
              {order.codeFixed ?? order.codePra}
            </p>
            <p className="font-inter text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
              {order.clientName}
              {order.companyName ? ` · ${order.companyName}` : ''}
              {' · '}{order.whatsapp}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span
              className="font-inter text-xs px-2 py-1 rounded"
              style={{
                background: order.phase === 'fixed' ? '#DCFCE7' : '#EDE9FE',
                color: order.phase === 'fixed' ? '#166534' : '#5B21B6',
              }}
            >
              {order.phase === 'fixed' ? 'Fixed Order' : 'Pra-order'}
            </span>
            <a
              href={`/order/${order.codeFixed ?? order.codePra}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-inter text-xs flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: '#F3F4F6', color: '#6B7280' }}
            >
              <ExternalLink size={11} /> Client view
            </a>
            {/* Kirim Kode via WA */}
            <a
              href={getWALink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-inter text-xs px-3 py-1.5 rounded-lg"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <MessageCircle size={12} />
              Kirim Kode via WA
            </a>
          </div>
        </div>

        {/* Status selector */}
        <div className="flex items-center gap-3">
          <span className="font-inter text-xs" style={lbl}>Status:</span>
          <select
            value={order.productionStatus ?? 'received'}
            onChange={e => updateStatus(e.target.value)}
            disabled={savingStatus}
            className="font-inter text-sm rounded-lg px-3 py-1.5 outline-none"
            style={{ background: currentStatus?.bg ?? '#F3F4F6', color: currentStatus?.text ?? '#374151', border: 'none' }}
          >
            {STATUSES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          {savingStatus && (
            <span className="animate-spin w-4 h-4 border-2 rounded-full"
              style={{ borderColor: '#E5E7EB', borderTopColor: '#E8470A' }} />
          )}
        </div>
      </div>

      {/* 4 Tabs */}
      <div
        className="flex gap-1 mb-4 rounded-xl p-1"
        style={{ background: '#F3F4F6' }}
      >
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 font-inter text-xs py-2 rounded-lg transition-all"
            style={{
              background: tab === t.key ? '#fff' : 'transparent',
              color: t.key === 'internal'
                ? (tab === t.key ? '#E8470A' : '#9CA3AF')
                : (tab === t.key ? '#1A1A1A' : '#9CA3AF'),
              fontWeight: tab === t.key ? 600 : 400,
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Spesifikasi */}
      {tab === 'spesifikasi' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-5" style={cardSt}>
            <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
              Spesifikasi Tas
            </h3>
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
                ['Estimasi Selesai', order.estimatedDone
                  ? new Date(order.estimatedDone).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="font-inter mb-0.5" style={lbl}>{l}</p>
                  <p className="font-inter" style={val}>{v}</p>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                <p className="font-inter mb-1" style={lbl}>Catatan Client</p>
                <p className="font-inter text-sm" style={{ color: '#374151' }}>{order.notes}</p>
              </div>
            )}
          </div>

          {/* Harga jual */}
          <div className="rounded-xl p-5" style={cardSt}>
            <h3 className="font-montserrat font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>Harga Jual</h3>
            {sp > 0 && (
              <p className="font-montserrat font-bold text-xl mb-3" style={{ color: '#7AB611' }}>
                {formatRupiah(sp)}
              </p>
            )}
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
                className="font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40"
                style={{ background: '#5A8A0A' }}
              >
                {savingPrice ? '...' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* Upgrade PRA → Fixed */}
          {order.phase === 'pra' && (
            <div className="rounded-xl p-5" style={{ ...cardSt, border: '1.5px solid rgba(232,71,10,0.2)' }}>
              <h3 className="font-montserrat font-semibold text-sm mb-1" style={{ color: '#1A1A1A' }}>
                Upgrade ke Fixed
              </h3>
              <p className="font-inter text-xs mb-3" style={{ color: '#9CA3AF' }}>
                Setelah konfirmasi client — nonaktifkan kode PRA dan buat kode Fixed.
              </p>
              <div className="flex gap-2">
                <input
                  value={fixedCode}
                  onChange={e => setFixedCode(e.target.value.toUpperCase())}
                  placeholder="Kode Fixed (contoh: SBC-001)"
                  className="flex-1 font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}
                />
                <button
                  onClick={upgradeToFixed}
                  disabled={upgrading || !fixedCode.trim()}
                  className="font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40"
                  style={{ background: '#E8470A' }}
                >
                  {upgrading ? '...' : 'Upgrade'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Pembayaran */}
      {tab === 'pembayaran' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-5" style={cardSt}>
            <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
              Ringkasan Pembayaran
            </h3>
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
                  <p className="font-inter text-xs mb-1" style={lbl}>{item.l}</p>
                  <p className="font-montserrat font-bold text-sm" style={{ color: item.c }}>{item.v}</p>
                </div>
              ))}
            </div>
            {payments.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center rounded-lg px-3 py-2.5 mb-2"
                style={{ background: '#F9FAF6' }}>
                <div>
                  <p className="font-inter text-sm" style={{ color: '#374151' }}>
                    {p.description ?? `Angsuran ${i + 1}`}
                  </p>
                  <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{p.date}</p>
                </div>
                <p className="font-montserrat font-semibold text-sm" style={{ color: '#7AB611' }}>
                  {formatRupiah(p.amount)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-5" style={cardSt}>
            <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
              Tambah Pembayaran
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="font-inter text-xs mb-1" style={lbl}>Jumlah</p>
                <input value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  placeholder="Rp ..."
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }} />
              </div>
              <div>
                <p className="font-inter text-xs mb-1" style={lbl}>Tanggal</p>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }} />
              </div>
              <div className="col-span-2">
                <p className="font-inter text-xs mb-1" style={lbl}>Keterangan</p>
                <input value={payDesc} onChange={e => setPayDesc(e.target.value)}
                  placeholder="DP 50%, Pelunasan, dll"
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }} />
              </div>
            </div>
            <button onClick={addPayment} disabled={savingPay || !payAmount}
              className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40"
              style={{ background: '#5A8A0A' }}>
              {savingPay ? '...' : <><Plus size={15} /> Tambah Pembayaran</>}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Dokumen */}
      {tab === 'dokumen' && (
        <div className="rounded-xl p-5" style={cardSt}>
          <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
            Generate Dokumen
          </h3>
          <div className="mb-3">
            <p className="font-inter text-xs mb-1.5" style={lbl}>Packaging fee (tambahan invoice)</p>
            <input value={packagingFee} onChange={e => setPackagingFee(e.target.value)}
              className="font-inter text-sm rounded-lg px-3 py-2 outline-none w-40"
              style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }} />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={generateInvoice} disabled={genInvoice}
              className="flex items-center gap-2 font-inter text-sm font-semibold rounded-lg px-4 py-2.5 disabled:opacity-50"
              style={{ background: 'rgba(232,71,10,0.1)', color: '#E8470A', border: '1px solid rgba(232,71,10,0.2)' }}>
              <FileText size={15} />
              {genInvoice ? 'Generating...' : order.invoiceUrl ? 'Regenerate Invoice' : 'Generate Invoice'}
            </button>
            <button onClick={generateKwitansi} disabled={genKwitansi || payments.length === 0}
              className="flex items-center gap-2 font-inter text-sm font-semibold rounded-lg px-4 py-2.5 disabled:opacity-50"
              style={{ background: 'rgba(90,138,10,0.1)', color: '#5A8A0A', border: '1px solid rgba(90,138,10,0.2)' }}>
              <Receipt size={15} />
              {genKwitansi ? 'Generating...' : 'Generate Kwitansi'}
            </button>
          </div>
          {(order.invoiceUrl || order.kwitansiUrl) && (
            <div className="flex gap-2">
              {order.invoiceUrl && (
                <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-inter text-xs rounded-lg px-3 py-2"
                  style={{ color: '#E8470A', border: '1px solid rgba(232,71,10,0.2)' }}>
                  <ExternalLink size={12} /> Invoice
                </a>
              )}
              {order.kwitansiUrl && (
                <a href={order.kwitansiUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-inter text-xs rounded-lg px-3 py-2"
                  style={{ color: '#5A8A0A', border: '1px solid rgba(90,138,10,0.2)' }}>
                  <ExternalLink size={12} /> Kwitansi
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Internal */}
      {tab === 'internal' && (
        <div className="rounded-xl p-5" style={cardSt}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
              Catatan Internal
            </h3>
            <span
              className="font-inter text-xs px-2 py-0.5 rounded"
              style={{ background: '#FEE2E2', color: '#991B1B' }}
            >
              Tidak tampil ke client
            </span>
          </div>
          <p className="font-inter text-xs mb-3" style={{ color: '#9CA3AF' }}>
            Auto-save setiap 30 detik
          </p>
          <textarea
            value={internalNotes}
            onChange={e => setInternalNotes(e.target.value)}
            rows={10}
            placeholder="Catatan produksi, permasalahan, bahan yang dipakai, dll..."
            className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none mb-3"
            style={{
              background: '#F9FAF6', border: '1px solid #E5E7EB',
              color: '#1A1A1A', resize: 'vertical',
            }}
          />
          <button onClick={saveInternalNotes} disabled={savingNotes}
            className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40 transition-all"
            style={{ background: notesSaved ? '#7AB611' : '#E8470A' }}>
            {savingNotes
              ? <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</>
              : notesSaved
                ? '✓ Tersimpan!'
                : <><Save size={15} /> Simpan Sekarang</>}
          </button>
        </div>
      )}
    </div>
  )
}
