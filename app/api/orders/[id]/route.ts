import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [order] = await db.select().from(orders).where(eq(orders.id, params.id))
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const [updated] = await db.update(orders)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(orders.id, params.id))
    .returning()

  return NextResponse.json(updated)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Handle upgrade pra → fixed
  if (body.action === 'upgrade') {
    const [order] = await db.select().from(orders).where(eq(orders.id, params.id))
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [updated] = await db.update(orders)
      .set({
        phase: 'fixed',
        codeFixed: body.codeFixed,
        codePraActive: false,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.id))
      .returning()

    return NextResponse.json(updated)
  }

  // Handle status update
  if (body.productionStatus) {
    const [updated] = await db.update(orders)
      .set({ productionStatus: body.productionStatus, updatedAt: new Date() })
      .where(eq(orders.id, params.id))
      .returning()
    return NextResponse.json(updated)
  }

  // Handle payment addition
  if (body.payment) {
    const [order] = await db.select().from(orders).where(eq(orders.id, params.id))
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const payments = Array.isArray(order.payments) ? order.payments as any[] : []
    payments.push({ ...body.payment, id: Date.now().toString(), createdAt: new Date() })

    const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
    const isLunas = totalPaid >= Number(order.sellingPrice)

    const [updated] = await db.update(orders)
      .set({
        payments,
        productionStatus: isLunas ? 'done' : order.productionStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.id))
      .returning()

    return NextResponse.json(updated)
  }

  // Handle internal notes
  if (body.internalNotes !== undefined) {
    const [updated] = await db.update(orders)
      .set({ internalNotes: body.internalNotes, updatedAt: new Date() })
      .where(eq(orders.id, params.id))
      .returning()
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
