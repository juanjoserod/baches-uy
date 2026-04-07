import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface StatsBarProps {
  active: number
  repaired: number
  newCount: number
}

export default function StatsBar({ active, repaired, newCount }: StatsBarProps) {
  return (
    <div className="px-4 pt-5 pb-2">
      <div className="max-w-7xl mx-auto grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 shadow-[0_12px_28px_rgba(16,33,51,0.05)]">
          <span className="flex items-center gap-2 text-sky-700 font-semibold text-sm">
            <AlertCircle size={15} strokeWidth={2.2} />
            {active} activos
          </span>
          <p className="text-xs text-slate-500 mt-1">Reportes visibles sin resolución marcada.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3 shadow-[0_12px_28px_rgba(16,33,51,0.05)]">
          <span className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <CheckCircle2 size={15} strokeWidth={2.2} />
            {repaired} reparados
          </span>
          <p className="text-xs text-slate-500 mt-1">Casos que ya muestran una solución reportada.</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,#0f4f88,#176ab6)] px-4 py-3 shadow-[0_14px_30px_rgba(23,106,182,0.2)]">
          <span className="flex items-center gap-2 text-white font-semibold text-sm">
            <Clock size={15} strokeWidth={2.2} />
            {newCount} nuevos
          </span>
          <p className="text-xs text-sky-100/90 mt-1">Casos cargados recientemente por la comunidad.</p>
        </div>
      </div>
    </div>
  )
}
