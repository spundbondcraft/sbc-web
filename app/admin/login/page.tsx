'use client'
import { useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const result = await signIn('credentials', {
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/admin')
    } else {
      setError(true)
      setLoading(false)
      gsap.fromTo(formRef.current,
        { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' }
      )
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0D1F00' }}
    >
      <div ref={formRef} className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(232,71,10,0.15)', border: '1px solid rgba(232,71,10,0.3)' }}
          >
            <Lock size={24} style={{ color: '#E8470A' }} />
          </div>
          <h1 className="font-montserrat font-bold text-white text-2xl mb-1">SBC Admin</h1>
          <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>Internal dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full font-inter rounded-xl outline-none pr-12"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${error ? '#E8470A' : 'rgba(255,255,255,0.1)'}`,
                color: '#fff',
                padding: '14px 16px',
              }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#9CA3AF' }}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="font-inter text-sm text-center" style={{ color: '#FCA5A5' }}>
              Password salah.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-montserrat font-semibold rounded-xl py-3.5 text-white transition-opacity disabled:opacity-40"
            style={{ background: '#E8470A' }}
          >
            {loading
              ? <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
