'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapPin, Search } from 'lucide-react'
import type { Report, ReportStatus, RoadType } from '@/types'
import { STATUS_LABELS, ROAD_TYPE_LABELS, DEPARTMENTS } from '@/types'
import ReportCard from '@/components/ReportCard'

const STATUS_OPTIONS: ReportStatus[] = ['nuevo', 'confirmado', 'enviado', 'reparado', 'cerrado']
const ROAD_OPTIONS: RoadType[] = ['calle', 'vereda', 'ciclovia', 'camino']

export default function ListaPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [roadFilter, setRoadFilter] = useState<RoadType | 'all'>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'confirmed'>('newest')

  useEffect(() => {
    fetch('/api/reports', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setReports(data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = [...reports]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) => r.address.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') result = result.filter((r) => r.status === statusFilter)
    if (roadFilter !== 'all') result = result.filter((r) => r.road_type === roadFilter)
    if (deptFilter !== 'all') result = result.filter((r) => r.department === deptFilter)
    if (sortBy === 'confirmed') result.sort((a, b) => b.confirmed_count - a.confirmed_count)
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return result
  }, [reports, search, statusFilter, roadFilter, deptFilter, sortBy])

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Lista de baches</h1>
      <p className="text-gray-500 text-sm mb-5">{reports.length} reportes registrados</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscá por calle o departamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
        />
      </div>

      {/* Department dropdown */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-gray-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">Todos los departamentos</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status filter */}
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Estado:</span>
          {(['all', ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Road type filter */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Tipo:</span>
          {(['all', ...ROAD_OPTIONS] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoadFilter(r)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                roadFilter === r
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {r === 'all' ? 'Todos' : ROAD_TYPE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-4 mb-5 text-sm text-gray-600 border-b border-gray-100 pb-4">
        <span className="text-xs font-medium text-gray-500">⇅ Ordenar:</span>
        <button
          onClick={() => setSortBy('newest')}
          className={`font-medium ${sortBy === 'newest' ? 'text-gray-900 underline' : 'hover:text-gray-900'}`}
        >
          Más nuevos
        </button>
        <button
          onClick={() => setSortBy('confirmed')}
          className={`font-medium ${sortBy === 'confirmed' ? 'text-gray-900 underline' : 'hover:text-gray-900'}`}
        >
          Más confirmados
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MapPin size={34} className="mx-auto mb-3 text-sky-500" />
          <p className="font-medium">No se encontraron baches</p>
          <p className="text-sm mt-1">Probá con otros filtros</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
