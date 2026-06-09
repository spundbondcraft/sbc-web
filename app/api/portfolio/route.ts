import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, portfolio } from '@/lib/db'
import { eq, and, asc } from 'drizzle-orm'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const visibleOnly = searchParams.get('visible') === 'true'
  const limit = parseInt(searchParams.get('limit') ?? '100')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const items = await db.select().from(portfolio)
    .orderBy(asc(portfolio.sortOrder))

  let filtered = items
  if (visibleOnly) filtered = filtered.filter(p => p.isVisible)

  return NextResponse.json({
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { imageBase64, bagModel, sablonType, color } = body

  const { url, publicId, blurDataUrl } = await uploadImage(imageBase64, 'portfolio')

  const [item] = await db.insert(portfolio).values({
    id: `pf_${Date.now()}`,
    imageUrl: url,
    cloudinaryId: publicId,
    blurDataUrl,
    bagModel,
    sablonType,
    color,
    sortOrder: Date.now(),
    isVisible: true,
    createdAt: new Date(),
  }).returning()

  return NextResponse.json(item, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Reorder
  if (body.action === 'reorder' && Array.isArray(body.items)) {
    for (const { id, sortOrder } of body.items) {
      await db.update(portfolio)
        .set({ sortOrder })
        .where(eq(portfolio.id, id))
    }
    return NextResponse.json({ ok: true })
  }

  // Toggle visibility
  if (body.action === 'toggle' && body.id) {
    const [item] = await db.select().from(portfolio).where(eq(portfolio.id, body.id))
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const [updated] = await db.update(portfolio)
      .set({ isVisible: !item.isVisible })
      .where(eq(portfolio.id, body.id))
      .returning()
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
