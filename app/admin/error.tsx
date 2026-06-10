'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0D1F00' }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(232,71,10,0.15)', border: '1px solid rgba(232,71,10,0.3)' }}
        >
          <span style={{ fontSize: '28px' }}>⚠️</span>
        </div>
        <h1 className="font-montserrat font-bold text-2xl text-white mb-3">
          Terjadi kesalahan
        </h1>
        <p className="font-inter text-sm mb-2" style={{ color: '#9CA3AF' }}>
          Ada sesuatu yang tidak berjalan dengan semestinya.
        </p>
        {error.digest && (
          <p className="font-inter text-xs mb-6" style={{ color: '#6B7280' }}>
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="font-montserrat font-semibold text-sm text-white rounded-full px-6 py-3 transition-transform hover:scale-105"
            style={{ background: '#E8470A' }}
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="font-montserrat font-semibold text-sm rounded-full px-6 py-3"
            style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#9CA3AF' }}
          >
            Ke Home
          </a>
        </div>
      </div>
    </div>
  )
}
