'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import { CheckCircle, Clock, Package, Truck, Star, Download, MessageCircle } from 'lucide-react'
import type { Order } from '@/lib/db/schema'

const STATUSES = [
  { key: 'received', label: 'Order Diterima', Icon: CheckCircle },
  { key: 'assessment', label: 'Asesmen', Icon: Star },
  { key: 'confirmed', label: 'Konfirmasi Desain', Icon: CheckCircle },
  { key: 'production', label: 'Produksi', Icon: Package },
  { key: 'finishing', label: 'Finishing', Icon: Clock },
  { key: 'ready_to_ship', label: 'Siap Kirim', Icon: Truck },
  { key: 'shipped', label: 'Dikirim', Icon: Truck },
  { key: 'done', label: 'Selesai', Icon: Star },
]

interface ClientPortalProps { order: Order }

export function ClientPortal({ order }: ClientPortalProps) {
  const currentIdx = STATUSES.findIndex(s => s.key === order.productionStatus)
  const progressRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const payments = Array.isArray(order.payments) ? order.payments as any[] : []
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0)
  const sellingPrice = Number(order.sellingPrice ?? 0)
  const sisaHutang = Math.max(0, sellingPrice - totalPaid)
  const dpPercent = sellingPrice > 0 ? Math.round((totalPaid / sellingPrice) * 100) : 0
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    // Animate progress bar
    const targetWidth = currentIdx >= 0 ? `${(currentIdx / (STATUSES.length - 1)) * 100}%` : '0%'
    gsap.fromTo(progressRef.current,
      { width: '0%' },
      { width: targetWidth, duration: 1, delay: 0.4, ease: 'power2.out' }
    )
  }, [currentIdx])

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: '#0D1F00' }}
    >
      <div ref={cardRef} className="max-w-2xl mx-auto opacity-0">
        {/* Header card */}
        <div
          className="rounded-2xl p-6 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Kode Order</p>
              <p className="font-montserrat font-bold text-white text-xl">
                {order.codeFixed ?? order.codePra}
              </p>
              {order.phase === 'fixed' && order.codePra && (
                <span
                  className="font-inter text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: 'rgba(122,182,17,0.15)', color: '#7AB611' }}
                >
                  Upgraded dari PRA
                </span>
              )}
            </div>
            <div
              className="px-3 py-1.5 rounded-full font-inter text-xs font-semibold"
              style={{
                background: order.productionStatus === 'done'
                  ? 'rgba(122,182,17,0.2)' : 'rgba(232,71,10,0.15)',
                color: order.productionStatus === 'done' ? '#7AB611' : '#E8470A',
              }}
            >
              {STATUSES.find(s => s.key === order.productionStatus)?.label ?? order.productionStatus}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Nama" value={order.clientName} />
            <InfoRow label="Model" value={order.bagModel} />
            <InfoRow label="Qty" value={`${order.qty} pcs`} />
            <InfoRow label="Sablon" value={order.sablonType ?? '-'} />
            {order.estimatedDone && (
              <InfoRow
                label="Est. Selesai"
                value={new Date(order.estimatedDone).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
            )}
          </div>
        </div>

        {/* Progress tracker */}
        <div
          className="rounded-2xl p-6 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="font-montserrat font-bold text-white text-sm mb-6 uppercase tracking-widest">
            Progress Produksi
          </h3>

          {/* Progress bar */}
          <div className="relative mb-8">
            <div className="h-1 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div
              ref={progressRef}
              className="absolute top-0 left-0 h-1 rounded-full"
              style={{ background: '#E8470A', width: '0%' }}
            />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {STATUSES.map((status, i) => {
              const isCompleted = i <= currentIdx
              const isCurrent = i === currentIdx
              return (
                <div key={status.key} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isCompleted
                        ? (isCurrent ? '#E8470A' : '#5A8A0A')
                        : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <status.Icon
                      size={12}
                      style={{ color: isCompleted ? '#fff' : '#6B7280' }}
                    />
                  </div>
                  <span
                    className="font-inter text-sm"
                    style={{
                      color: isCurrent ? '#FFFFFF' : isCompleted ? '#9CA3AF' : '#4B5563',
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {status.label}
                  </span>
                  {isCurrent && (
                    <span
                      className="font-inter text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(232,71,10,0.15)', color: '#E8470A' }}
                    >
                      Saat ini
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment summary */}
        {sellingPrice > 0 && (
          <div
            className="rounded-2xl p-6 mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="font-montserrat font-bold text-white text-sm mb-4 uppercase tracking-widest">
              Status Pembayaran
            </h3>

            {/* Progress bar */}
            <div className="relative h-2 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="absolute top-0 left-0 h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${dpPercent}%`,
                  background: dpPercent >= 100 ? '#7AB611' : '#E8470A',
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Total</p>
                <p className="font-montserrat font-bold text-white text-sm">{formatRupiah(sellingPrice)}</p>
              </div>
              <div className="text-center">
                <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Terbayar</p>
                <p className="font-montserrat font-bold text-sm" style={{ color: '#7AB611' }}>
                  {formatRupiah(totalPaid)}
                </p>
              </div>
              <div className="text-center">
                <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Sisa</p>
                <p className="font-montserrat font-bold text-sm" style={{ color: sisaHutang > 0 ? '#E8470A' : '#7AB611' }}>
                  {sisaHutang > 0 ? formatRupiah(sisaHutang) : 'LUNAS'}
                </p>
              </div>
            </div>

            {/* Payment history */}
            {payments.length > 0 && (
              <div className="space-y-2">
                {payments.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center rounded-lg px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="font-inter text-xs" style={{ color: '#9CA3AF' }}>
                      {p.description ?? `Angsuran ${i + 1}`}
                    </span>
                    <span className="font-inter text-xs font-semibold" style={{ color: '#7AB611' }}>
                      {formatRupiah(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {(order.invoiceUrl || order.kwitansiUrl) && (
          <div
            className="rounded-2xl p-6 mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="font-montserrat font-bold text-white text-sm mb-4 uppercase tracking-widest">
              Dokumen
            </h3>
            <div className="flex flex-col gap-2">
              {order.invoiceUrl && (
                <a
                  href={order.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-inter text-sm rounded-lg px-4 py-3 transition-colors"
                  style={{
                    background: 'rgba(232,71,10,0.1)',
                    color: '#E8470A',
                    border: '1px solid rgba(232,71,10,0.2)',
                  }}
                >
                  <Download size={16} />
                  Download Invoice
                </a>
              )}
              {order.kwitansiUrl && (
                <a
                  href={order.kwitansiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-inter text-sm rounded-lg px-4 py-3 transition-colors"
                  style={{
                    background: 'rgba(90,138,10,0.1)',
                    color: '#7AB611',
                    border: '1px solid rgba(90,138,10,0.2)',
                  }}
                >
                  <Download size={16} />
                  Download Kwitansi
                </a>
              )}
            </div>
          </div>
        )}

        {/* CTA WA */}
        <a
          href={`https://wa.me/${waNumber}?text=Halo%20SBC.id%2C%20saya%20ingin%20menanyakan%20order%20${order.codeFixed ?? order.codePra}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl font-montserrat font-semibold text-white py-4 transition-transform hover:scale-[1.02]"
          style={{ background: '#25D366' }}
        >
          <MessageCircle size={18} />
          Tanya via WhatsApp
        </a>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-inter text-xs mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
      <p className="font-inter text-sm text-white">{value}</p>
    </div>
  )
}
