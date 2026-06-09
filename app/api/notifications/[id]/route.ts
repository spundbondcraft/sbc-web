import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, notifications } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [updated] = await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, params.id))
    .returning()

  return NextResponse.json(updated)
}
