import { NextRequest, NextResponse } from 'next/server'
import { db, orders } from '@/lib/db'
import { eq, or } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code

  const [order] = await db.select().from(orders).where(
    or(eq(orders.codePra, code), eq(orders.codeFixed, code))
  )

  if (!order) {
    return NextResponse.json({ valid: false, reason: 'not_found' })
  }

  // PRA code but no longer active
  if (order.codePra === code && !order.codePraActive) {
    return NextResponse.json({
      valid: false,
      reason: 'pra_inactive',
      fixedCode: order.codeFixed,
    })
  }

  return NextResponse.json({
    valid: true,
    phase: order.phase,
    orderId: order.id,
  })
}
