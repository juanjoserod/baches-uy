import { NextResponse } from 'next/server'
import { buildDashboardStats } from '@/lib/analytics'
import { getReports } from '@/lib/supabase'

export async function GET() {
  try {
    const reports = await getReports()
    const stats = buildDashboardStats(reports)
    return NextResponse.json({
      ...stats,
      generated_at: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
  }
}
