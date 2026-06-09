import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { generateOrderId } from '@/lib/utils/orderCode'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const phase = searchParams.get('phase')
  const status = searchParams.get('status')

  let query = db.select().from(orders).orderBy(desc(orders.createdAt))
  const results = await db.select().from(orders).orderBy(desc(orders.createdAt))

  let filtered = results
  if (phase) filtered = filtered.filter(o => o.phase === phase)
  if (status) filtered = filtered.filter(o => o.productionStatus === status)

  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Validate unique code
  if (body.codePra) {
    const existing = await db.select().from(orders)
      .where(eq(orders.codePra, body.codePra))
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Kode sudah digunakan' }, { status: 400 })
    }
  }

  const newOrder = {
    id: generateOrderId(),
    ...body,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const [created] = await db.insert(orders).values(newOrder).returning()
  return NextResponse.json(created, { status: 201 })
}
