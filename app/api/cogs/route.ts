export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, cogsConfig } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [config] = await db.select().from(cogsConfig)
  if (!config) {
    // Return defaults
    return NextResponse.json({
      id: 'singleton',
      fabricPricePerMeter: 0,
      threadPricePerRoll: 0,
      threadLengthPerRoll: 0,
      velcroPricePerRoll: 0,
      velcroLengthPerRoll: 0,
      zipperPricePerPcs: 0,
      mikaPricePerCm2: 0,
      mikaExtraSewing: 0,
      bannerPricePerCm2: 0,
      bannerExtraSewing: 0,
      dtfPricePerCm2: 0,
      rubberBinderPerGram: 0,
      rubberRubberPerGram: 0,
      rubberPigmentPerGram: 0,
      rubberLabor: 0,
      rubberFilm: 0,
      gasolineCost: 0,
      electricityCostPerOrder: 0,
      ropePricePerCm: 0,
      aluminumFoilLength: 0,
      aluminumFoilPrice: 0,
      bttkPercent: 20,
      depreciationPercent: 2,
      marginPercent: 25,
    })
  }
  return NextResponse.json(config)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify Thenewof password server-side
  const password = req.headers.get('x-config-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 403 })
  }

  const body = await req.json()

  const existing = await db.select().from(cogsConfig)
  let updated
  if (existing.length > 0) {
    ;[updated] = await db.update(cogsConfig)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(cogsConfig.id, 'singleton'))
      .returning()
  } else {
    ;[updated] = await db.insert(cogsConfig)
      .values({ id: 'singleton', ...body })
      .returning()
  }

  return NextResponse.json(updated)
}
