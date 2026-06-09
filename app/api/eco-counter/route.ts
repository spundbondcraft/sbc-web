import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, ecoCounter } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  const [counter] = await db.select().from(ecoCounter)
  return NextResponse.json(counter ?? { fabricRescuedKg: 0, bagsCollectedPcs: 0 })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const existing = await db.select().from(ecoCounter)

  let updated
  if (existing.length > 0) {
    ;[updated] = await db.update(ecoCounter)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(ecoCounter.id, 'singleton'))
      .returning()
  } else {
    ;[updated] = await db.insert(ecoCounter)
      .values({ id: 'singleton', ...body })
      .returning()
  }

  return NextResponse.json(updated)
}
