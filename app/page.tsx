import { getReports, getStats, getDepartmentCounts } from '@/lib/supabase'
import StatsBar from '@/components/StatsBar'
import HomeMap from '@/components/HomeMap'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Mapa — bachesuy.com',
  description: 'Mapa ciudadano de baches en Uruguay para explorar reportes, ver zonas afectadas y compartir evidencia pública.',
}

export default async function HomePage() {
  const [reports, stats, deptCounts] = await Promise.all([
    getReports().catch(() => []),
    getStats().catch(() => ({ active: 0, repaired: 0, newCount: 0 })),
    getDepartmentCounts().catch(() => []),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <StatsBar active={stats.active} repaired={stats.repaired} newCount={stats.newCount} />
      <HomeMap reports={reports} deptCounts={deptCounts} />
    </div>
  )
}
