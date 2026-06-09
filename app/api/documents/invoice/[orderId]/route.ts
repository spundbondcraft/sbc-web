import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { InvoicePDF } from '@/lib/pdf/invoice'
import { uploadImage } from '@/lib/cloudinary'
import { generateInvoiceNumber } from '@/lib/utils/orderCode'

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [order] = await db.select().from(orders).where(eq(orders.id, params.orderId))
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { packagingFee } = await req.json().catch(() => ({ packagingFee: 0 }))

  const invNum = order.invoiceNumber ?? generateInvoiceNumber(order.codeFixed ?? order.codePra ?? '')

  const element = React.createElement(InvoicePDF, { order, invoiceNumber: invNum, packagingFee }) as any

  const buffer = await renderToBuffer(element)

  const { url } = await uploadImage(buffer, 'invoices', `invoice_${order.id}`)

  await db.update(orders)
    .set({ invoiceUrl: url, invoiceNumber: invNum, updatedAt: new Date() })
    .where(eq(orders.id, params.orderId))

  return NextResponse.json({ url, invoiceNumber: invNum })
}
