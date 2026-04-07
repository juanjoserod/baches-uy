import type { Report, ReportStatus, RoadType } from '@/types'

interface BreakdownItem {
  label: string
  value: number
}

export interface DashboardStats {
  total: number
  active: number
  repaired: number
  newCount: number
  totalConfirmations: number
  reportsLast7Days: number
  reportsLast30Days: number
  departmentsWithReports: number
  topDepartments: BreakdownItem[]
  unresolvedDepartments: BreakdownItem[]
  statusBreakdown: BreakdownItem[]
  roadTypeBreakdown: BreakdownItem[]
}

const STATUS_TEXT: Record<ReportStatus, string> = {
  nuevo: 'Nuevos',
  confirmado: 'Confirmados',
  enviado: 'Enviados',
  reparado: 'Reparados',
  cerrado: 'Cerrados',
}

const ROAD_TEXT: Record<RoadType, string> = {
  calle: 'Calles',
  vereda: 'Veredas',
  ciclovia: 'Ciclovías',
  camino: 'Caminos',
}

function sortBreakdown(counts: Record<string, number>): BreakdownItem[] {
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

export function buildDashboardStats(reports: Report[]): DashboardStats {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  const byDepartment: Record<string, number> = {}
  const unresolvedByDepartment: Record<string, number> = {}
  const byStatus: Record<ReportStatus, number> = {
    nuevo: 0,
    confirmado: 0,
    enviado: 0,
    reparado: 0,
    cerrado: 0,
  }
  const byRoadType: Record<RoadType, number> = {
    calle: 0,
    vereda: 0,
    ciclovia: 0,
    camino: 0,
  }

  let totalConfirmations = 0
  let reportsLast7Days = 0
  let reportsLast30Days = 0

  for (const report of reports) {
    byDepartment[report.department] = (byDepartment[report.department] ?? 0) + 1
    byStatus[report.status] += 1
    byRoadType[report.road_type] += 1
    totalConfirmations += report.confirmed_count

    if (report.status !== 'reparado' && report.status !== 'cerrado') {
      unresolvedByDepartment[report.department] = (unresolvedByDepartment[report.department] ?? 0) + 1
    }

    const createdAt = new Date(report.created_at).getTime()
    if (createdAt >= sevenDaysAgo) reportsLast7Days += 1
    if (createdAt >= thirtyDaysAgo) reportsLast30Days += 1
  }

  return {
    total: reports.length,
    active: reports.filter((report) => report.status !== 'reparado' && report.status !== 'cerrado').length,
    repaired: byStatus.reparado,
    newCount: byStatus.nuevo,
    totalConfirmations,
    reportsLast7Days,
    reportsLast30Days,
    departmentsWithReports: Object.keys(byDepartment).length,
    topDepartments: sortBreakdown(byDepartment).slice(0, 5),
    unresolvedDepartments: sortBreakdown(unresolvedByDepartment).slice(0, 5),
    statusBreakdown: (Object.keys(byStatus) as ReportStatus[]).map((status) => ({
      label: STATUS_TEXT[status],
      value: byStatus[status],
    })),
    roadTypeBreakdown: (Object.keys(byRoadType) as RoadType[]).map((roadType) => ({
      label: ROAD_TEXT[roadType],
      value: byRoadType[roadType],
    })),
  }
}
