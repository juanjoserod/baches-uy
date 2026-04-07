'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Plus, Sparkles, ShieldAlert, Share2, Maximize2, X } from 'lucide-react'
import type { Map as LeafletMap } from 'leaflet'
import type { Report, DepartmentCount } from '@/types'
import MapViewDynamic from './MapViewDynamic'
import DepartmentSidebar from './DepartmentSidebar'

// Coordenadas centrales de cada departamento uruguayo
const DEPT_COORDS: Record<string, [number, number]> = {
  Artigas: [-30.4, -56.5],
  Canelones: [-34.52, -56.0],
  'Cerro Largo': [-32.35, -54.15],
  Colonia: [-34.1, -57.6],
  Durazno: [-33.0, -56.5],
  Flores: [-33.57, -56.9],
  Florida: [-34.1, -56.2],
  Lavalleja: [-34.37, -55.23],
  Maldonado: [-34.37, -54.95],
  Montevideo: [-34.9, -56.18],
  Paysandú: [-32.32, -58.08],
  'Río Negro': [-33.0, -58.0],
  Rivera: [-31.38, -55.55],
  Rocha: [-33.9, -53.95],
  Salto: [-31.38, -57.96],
  'San José': [-34.34, -56.7],
  Soriano: [-33.5, -57.8],
  Tacuarembó: [-31.72, -55.98],
  'Treinta y Tres': [-33.07, -54.38],
}

interface HomeMapProps {
  reports: Report[]
  deptCounts: DepartmentCount[]
}

export default function HomeMap({ reports, deptCounts }: HomeMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const fullscreenMapRef = useRef<LeafletMap | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const topDepartment = deptCounts[0]

  useEffect(() => {
    if (!isFullscreen) return

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsFullscreen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [isFullscreen])

  function handleDeptClick(dept: string) {
    const coords = DEPT_COORDS[dept]
    const activeMap = isFullscreen ? fullscreenMapRef.current : mapRef.current
    if (coords && activeMap) {
      activeMap.flyTo(coords, 11, { animate: true, duration: 1.2 })
    }
  }

  return (
    <section className="max-w-7xl mx-auto w-full px-4 pb-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr] mb-4">
        <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(150deg,#ffffff_0%,#eef7ff_70%,#dbeeff_100%)] p-6 shadow-[0_20px_45px_rgba(16,33,51,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 mb-4">
            <Sparkles size={13} />
            Observatorio ciudadano
          </div>
          <h1 className="text-3xl sm:text-[2.15rem] leading-tight font-semibold text-slate-950 tracking-tight mb-3">
            Hacé visible el estado real de las calles en Uruguay
          </h1>
          <p className="text-slate-600 text-sm sm:text-[15px] leading-6 mb-6">
            Un mapa colaborativo para reportar baches, amplificar reclamos vecinales y ordenar la conversación pública con evidencia clara.
          </p>
          <p className="text-xs text-slate-500 mb-6 whitespace-nowrap overflow-hidden text-ellipsis">
            Inspirado en <a href="https://asfaltkje.si/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:text-sky-800">asfaltkje.si</a>, adaptado al contexto uruguayo.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <div className="rounded-2xl bg-white/90 border border-sky-100 p-3">
              <ShieldAlert size={16} className="text-sky-600 mb-2" />
              <p className="text-xs font-semibold text-slate-800">Ubicaciones concretas</p>
              <p className="text-xs text-slate-500 mt-1">Cada punto ayuda a mostrar dónde se concentra el problema.</p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-sky-100 p-3">
              <Share2 size={16} className="text-sky-600 mb-2" />
              <p className="text-xs font-semibold text-slate-800">Difusión rápida</p>
              <p className="text-xs text-slate-500 mt-1">Compartí reportes y convertí casos aislados en presión colectiva.</p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-sky-100 p-3">
              <Sparkles size={16} className="text-sky-600 mb-2" />
              <p className="text-xs font-semibold text-slate-800">Datos simples</p>
              <p className="text-xs text-slate-500 mt-1">Visualizá volumen por zona sin perder claridad de uso.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/reportar"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-full shadow-[0_14px_28px_rgba(23,106,182,0.28)] transition-all hover:-translate-y-0.5 text-sm"
            >
              <Plus size={16} strokeWidth={2.5} /> Reportar bache
            </Link>
            {topDepartment && (
              <p className="text-sm text-slate-500">
                Hoy lidera <span className="font-semibold text-slate-800">{topDepartment.department}</span> con {topDepartment.count} reportes activos.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-sky-100 bg-white/70 p-3 shadow-[0_24px_50px_rgba(16,33,51,0.08)]">
          <div className="relative overflow-hidden rounded-[24px] h-[620px]">
            <MapViewDynamic
              reports={reports}
              onMapReady={(map) => { mapRef.current = map }}
            />
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-6 left-6 z-[400] inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_14px_28px_rgba(16,33,51,0.12)] backdrop-blur-sm hover:bg-white sm:bottom-auto sm:left-auto sm:top-5 sm:right-20"
              aria-label="Abrir mapa en pantalla completa"
            >
              <Maximize2 size={14} />
              <span className="hidden sm:inline">Pantalla completa</span>
            </button>
            <DepartmentSidebar counts={deptCounts} onDeptClick={handleDeptClick} />
            <Link
              href="/reportar"
              className="absolute bottom-6 right-6 z-[400] flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-full shadow-[0_16px_32px_rgba(23,106,182,0.28)] transition-all hover:-translate-y-0.5 text-sm"
            >
              <Plus size={16} strokeWidth={2.5} /> Nuevo reporte
            </Link>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/82 p-4 sm:p-6">
          <div className="relative h-full rounded-[28px] border border-sky-100/20 bg-white/95 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.25)]">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-5 left-5 z-[500] inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800"
              aria-label="Cerrar pantalla completa"
            >
              <X size={18} />
            </button>
            <div className="relative h-full overflow-hidden rounded-[22px]">
              <MapViewDynamic
                reports={reports}
                onMapReady={(map) => { fullscreenMapRef.current = map }}
              />
              <DepartmentSidebar
                counts={deptCounts}
                onDeptClick={handleDeptClick}
                className="absolute top-20 left-4 right-4 z-[450] w-auto max-w-sm bg-white/95 rounded-[24px] shadow-[0_20px_40px_rgba(16,33,51,0.14)] border border-sky-100/90 backdrop-blur-sm md:top-6 md:left-6 md:right-auto md:w-80"
                collapsedButtonClassName="absolute top-20 left-4 z-[450] bg-white/95 rounded-2xl shadow-[0_16px_30px_rgba(16,33,51,0.12)] border border-sky-100 p-3 text-sky-700 hover:bg-sky-50 md:top-6 md:left-6"
              />
              <Link
                href="/reportar"
                className="absolute bottom-4 right-4 z-[450] inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(23,106,182,0.28)] transition-all hover:-translate-y-0.5 hover:bg-sky-700 md:bottom-6 md:right-6"
              >
                <Plus size={16} strokeWidth={2.5} /> Nuevo reporte
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
