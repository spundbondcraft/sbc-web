import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { KwitansiPDF } from '@/lib/pdf/kwitansi'
import { uploadImage } from '@/lib/cloudinary'
import { generateInvoiceNumber } from '@/lib/utils/orderCode'

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [order] = await db.select().from(orders).where(eq(orders.id, params.orderId))
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const invNum = order.invoiceNumber ?? generateInvoiceNumber(order.codeFixed ?? order.codePra ?? '')

  const element = React.createElement(KwitansiPDF, { order, invoiceNumber: invNum }) as any

  const buffer = await renderToBuffer(element)

  const { url } = await uploadImage(buffer, 'kwitansi', `kwitansi_${order.id}`)

  await db.update(orders)
    .set({ kwitansiUrl: url, updatedAt: new Date() })
    .where(eq(orders.id, params.orderId))

  return NextResponse.json({ url })
}
