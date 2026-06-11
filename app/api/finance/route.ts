export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // YYYY-MM
  const exportXlsx = searchParams.get('export') === 'true'

  const allOrders = await db.select().from(orders)
  let filtered = allOrders.filter(o => o.productionStatus === 'done')

  if (month) {
    const [y, m] = month.split('-').map(Number)
    const start = startOfMonth(new Date(y, m - 1))
    const end = endOfMonth(new Date(y, m - 1))
    filtered = filtered.filter(o => {
      if (!o.updatedAt) return false
      const d = new Date(o.updatedAt)
      return d >= start && d <= end
    })
  }

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.sellingPrice ?? 0), 0)
  const totalCogs = filtered.reduce((s, o) => s + Number(o.cogsTotal ?? 0), 0)
  const totalProfit = totalRevenue - totalCogs

  if (exportXlsx) {
    // Return data for client-side xlsx generation
    return NextResponse.json({
      orders: filtered.map(o => ({
        kode: o.codeFixed ?? o.codePra,
        klien: o.clientName,
        tanggal: o.updatedAt,
        pendapatan: o.sellingPrice,
        cogs: o.cogsTotal,
        profit: Number(o.sellingPrice ?? 0) - Number(o.cogsTotal ?? 0),
      })),
      summary: { totalRevenue, totalCogs, totalProfit },
    })
  }

  return NextResponse.json({
    orders: filtered,
    summary: { totalRevenue, totalCogs, totalProfit },
  })
}
