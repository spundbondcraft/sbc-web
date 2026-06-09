import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, notifications } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.select().from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(50)

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const [notif] = await db.insert(notifications).values({
    id: `notif_${Date.now()}`,
    type: body.type,
    orderId: body.orderId,
    orderCode: body.orderCode,
    clientName: body.clientName,
    message: body.message ?? `Portal dibuka oleh ${body.clientName} (${body.orderCode})`,
    isRead: false,
    createdAt: new Date(),
  }).returning()

  return NextResponse.json(notif, { status: 201 })
}
