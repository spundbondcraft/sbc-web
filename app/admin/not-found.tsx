import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0D1F00' }}
    >
      <div className="text-center">
        <p
          className="font-montserrat font-bold mb-2"
          style={{ fontSize: '96px', color: '#E8470A', lineHeight: 1 }}
        >
          404
        </p>
        <h1 className="font-montserrat font-bold text-2xl text-white mb-3">
          Halaman tidak ditemukan
        </h1>
        <p className="font-inter text-sm mb-8" style={{ color: '#9CA3AF' }}>
          URL yang kamu akses tidak ada atau sudah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="font-montserrat font-semibold text-sm text-white rounded-full px-6 py-3 transition-transform hover:scale-105"
            style={{ background: '#E8470A' }}
          >
            Kembali ke Home
          </Link>
          <Link
            href="/track"
            className="font-montserrat font-semibold text-sm rounded-full px-6 py-3 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#9CA3AF' }}
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  )
}
