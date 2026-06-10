'use client'
import { useEffect, useState } from 'react'
import { Save, Leaf, Phone, Globe, RefreshCw } from 'lucide-react'

export default function AdminSettingsPage() {
  const [eco, setEco] = useState({ fabricRescuedKg: '0', bagsCollectedPcs: '0' })
  const [savingEco, setSavingEco] = useState(false)
  const [ecoSaved, setEcoSaved] = useState(false)

  const [waNumber, setWaNumber] = useState(process.env.NEXT_PUBLIC_WA_NUMBER ?? '')
  const [appUrl, setAppUrl] = useState(process.env.NEXT_PUBLIC_APP_URL ?? '')

  useEffect(() => {
    fetch('/api/eco-counter')
      .then(r => r.json())
      .then(d => {
        setEco({
          fabricRescuedKg: String(d.fabricRescuedKg ?? 0),
          bagsCollectedPcs: String(d.bagsCollectedPcs ?? 0),
        })
      })
      .catch(() => {})
  }, [])

  const saveEco = async () => {
    setSavingEco(true)
    await fetch('/api/eco-counter', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fabricRescuedKg: parseFloat(eco.fabricRescuedKg),
        bagsCollectedPcs: parseInt(eco.bagsCollectedPcs),
      }),
    })
    setSavingEco(false)
    setEcoSaved(true)
    setTimeout(() => setEcoSaved(false), 2000)
  }

  const cardStyle = { background: '#fff', border: '1px solid #E5E7EB' }
  const inputStyle = {
    background: '#F9FAF6', border: '1px solid #E5E7EB',
    color: '#1A1A1A', borderRadius: '8px', padding: '10px 12px',
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Settings</h1>
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Konfigurasi konten & data website
        </p>
      </div>

      {/* Eco Counter */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={18} style={{ color: '#7AB611' }} />
          <h2 className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
            Eco Circular Counter
          </h2>
        </div>
        <p className="font-inter text-xs mb-4" style={{ color: '#9CA3AF' }}>
          Angka ini ditampilkan di landing page bagian Eco Circular.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="font-inter text-xs mb-1.5" style={{ color: '#9CA3AF' }}>Kain Terselamatkan (kg)</p>
            <input
              type="number"
              value={eco.fabricRescuedKg}
              onChange={e => setEco(prev => ({ ...prev, fabricRescuedKg: e.target.value }))}
              className="w-full font-inter text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <p className="font-inter text-xs mb-1.5" style={{ color: '#9CA3AF' }}>Tas Dikumpulkan (pcs)</p>
            <input
              type="number"
              value={eco.bagsCollectedPcs}
              onChange={e => setEco(prev => ({ ...prev, bagsCollectedPcs: e.target.value }))}
              className="w-full font-inter text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
        <button
          onClick={saveEco}
          disabled={savingEco}
          className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 disabled:opacity-40 transition-all"
          style={{ background: ecoSaved ? '#7AB611' : '#5A8A0A' }}
        >
          {savingEco
            ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : ecoSaved
              ? '✓ Tersimpan!'
              : <><Save size={15} /> Simpan Counter</>}
        </button>
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Phone size={18} style={{ color: '#25D366' }} />
          <h2 className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
            Kontak WhatsApp
          </h2>
        </div>
        <p className="font-inter text-xs mb-3" style={{ color: '#9CA3AF' }}>
          Nomor WA yang digunakan di tombol CTA seluruh website.
          Ubah via environment variable <code className="px-1 rounded" style={{ background: '#F3F4F6' }}>NEXT_PUBLIC_WA_NUMBER</code>
        </p>
        <div
          className="rounded-lg px-3 py-2.5 font-inter text-sm"
          style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#9CA3AF' }}
        >
          {process.env.NEXT_PUBLIC_WA_NUMBER ?? ''} (read-only)
        </div>
      </div>

      {/* App Info */}
      <div className="rounded-xl p-5 mb-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} style={{ color: '#5A8A0A' }} />
          <h2 className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A1A' }}>
            Info Aplikasi
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'App URL', value: process.env.NEXT_PUBLIC_APP_URL ?? 'https://spundbondcraft.vercel.app' },
            { label: 'Stack', value: 'Next.js 14 · Neon PostgreSQL · Drizzle · NextAuth' },
            { label: 'PDF Engine', value: '@react-pdf/renderer' },
            { label: 'Storage', value: 'Cloudinary' },
            { label: 'Animations', value: 'GSAP · Three.js · Framer Motion · Lenis' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{label}</span>
              <span className="font-inter text-xs" style={{ color: '#374151' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
          Quick Links
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { label: '→ Landing Page', href: '/' },
            { label: '→ Track Order', href: '/track' },
            { label: '→ Neon Console', href: 'https://console.neon.tech' },
            { label: '→ Cloudinary Console', href: 'https://cloudinary.com' },
            { label: '→ Vercel Dashboard', href: 'https://vercel.com' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="font-inter text-sm transition-colors"
              style={{ color: '#E8470A' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
