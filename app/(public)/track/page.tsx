'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Search, ArrowRight, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export default function TrackPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/orders/validate/${code.trim().toUpperCase()}`)
      const data = await res.json()

      if (!data.valid) {
        if (data.reason === 'pra_inactive') {
          setError(`Kode PRA ini tidak lagi aktif. Gunakan kode fixed: ${data.fixedCode}`)
        } else {
          setError('Kode order tidak ditemukan. Cek kembali kode yang kamu masukkan.')
        }
        gsap.fromTo(errorRef.current,
          { x: -10 }, { x: 0, duration: 0.3, ease: 'elastic.out(1,0.3)' }
        )
      } else {
        // Log portal visit notification
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'portal_visit', orderCode: code.trim().toUpperCase() }),
        }).catch(() => {})

        router.push(`/order/${code.trim().toUpperCase()}`)
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: '#0D1F00' }}
      >
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(232,71,10,0.12)', border: '1px solid rgba(232,71,10,0.3)' }}
          >
            <Search size={28} style={{ color: '#E8470A' }} />
          </div>

          <h1 className="font-montserrat font-bold text-white text-3xl mb-2">
            Track your order
          </h1>
          <p className="font-inter mb-10" style={{ color: '#9CA3AF' }}>
            Masukkan kode order yang kamu terima via WhatsApp
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SBC-001 atau SBC-001-PRA"
                autoFocus
                className="w-full font-montserrat font-semibold text-center text-lg rounded-xl outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  padding: '16px 20px',
                  letterSpacing: '0.05em',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E8470A'
                  e.target.style.background = 'rgba(255,255,255,0.09)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.target.style.background = 'rgba(255,255,255,0.06)'
                }}
              />
            </div>

            {error && (
              <div
                ref={errorRef}
                className="flex items-start gap-2 rounded-lg p-3 text-left"
                style={{ background: 'rgba(232,71,10,0.12)', border: '1px solid rgba(232,71,10,0.3)' }}
              >
                <AlertCircle size={16} style={{ color: '#E8470A', flexShrink: 0, marginTop: 2 }} />
                <p className="font-inter text-sm" style={{ color: '#FCA5A5' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full font-montserrat font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
              style={{
                background: '#E8470A',
                color: '#FFFFFF',
                padding: '16px',
                fontSize: '16px',
              }}
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>Lihat progress <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="font-inter text-xs mt-8" style={{ color: '#6B7280' }}>
            Belum punya kode? Hubungi kami via WhatsApp untuk memulai order baru.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
