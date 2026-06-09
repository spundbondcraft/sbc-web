import { notFound } from 'next/navigation'
import { db, orders } from '@/lib/db'
import { eq, or } from 'drizzle-orm'
import { ClientPortal } from '@/components/portal/ClientPortal'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

interface Props { params: { code: string } }

export default async function OrderPortalPage({ params }: Props) {
  const code = params.code.toUpperCase()

  const [order] = await db.select().from(orders).where(
    or(eq(orders.codePra, code), eq(orders.codeFixed, code))
  )

  if (!order) notFound()

  // Validate PRA still active
  if (order.codePra === code && !order.codePraActive) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ background: '#0D1F00' }}
      >
        <div>
          <p className="font-montserrat font-bold text-white text-xl mb-2">
            Kode ini sudah tidak aktif.
          </p>
          <p className="font-inter text-sm mb-4" style={{ color: '#9CA3AF' }}>
            Gunakan kode fixed kamu: <strong style={{ color: '#E8470A' }}>{order.codeFixed}</strong>
          </p>
          <a
            href={`/order/${order.codeFixed}`}
            className="font-montserrat font-semibold text-white rounded-full px-6 py-3 inline-block"
            style={{ background: '#E8470A' }}
          >
            Buka dengan kode fixed →
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <ClientPortal order={JSON.parse(JSON.stringify(order))} />
      <Footer />
    </>
  )
}
