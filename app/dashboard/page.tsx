import { buildDashboardStats } from '@/lib/analytics'
import { getReports } from '@/lib/supabase'

export const metadata = {
  title: 'Dashboard — baches.uy',
}

export const dynamic = 'force-dynamic'

function StatCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-2">{helper}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const reports = await getReports().catch(() => [])
  const stats = buildDashboardStats(reports)

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700 mb-2">
          Datos para visibilizar
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard ciudadano</h1>
        <p className="text-gray-600 mt-2 max-w-3xl">
          Este panel está pensado para compartir números claros sobre el problema, mostrar concentración geográfica y ayudar a que medios, vecinos y organizaciones presionen con evidencia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Reportes totales" value={stats.total} helper="Cantidad total de baches cargados por la comunidad." />
        <StatCard label="Activos" value={stats.active} helper="Siguen abiertos o sin resolución visible." />
        <StatCard label="Confirmaciones" value={stats.totalConfirmations} helper="Vecinos que reforzaron que el problema existe." />
        <StatCard label="Departamentos" value={stats.departmentsWithReports} helper="Alcance territorial actual de los reportes." />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900 mb-4">Actividad reciente</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Últimos 7 días</span>
              <span className="text-lg font-bold text-gray-900">{stats.reportsLast7Days}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Últimos 30 días</span>
              <span className="text-lg font-bold text-gray-900">{stats.reportsLast30Days}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Reparados</span>
              <span className="text-lg font-bold text-gray-900">{stats.repaired}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Nuevos</span>
              <span className="text-lg font-bold text-gray-900">{stats.newCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900 mb-4">Departamentos más reportados</h2>
          <div className="space-y-3">
            {stats.topDepartments.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900 mb-4">Casos activos por departamento</h2>
          <div className="space-y-3">
            {stats.unresolvedDepartments.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gray-900"
                    style={{ width: `${stats.active > 0 ? (item.value / stats.active) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900 mb-4">Estados de los reportes</h2>
          <div className="space-y-3">
            {stats.statusBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-lg font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900 mb-4">Tipo de vía más afectada</h2>
          <div className="space-y-3">
            {stats.roadTypeBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-lg font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
