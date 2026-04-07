import { ArrowRight, CheckCircle2, Clock3, FileText, ShieldCheck, Wrench } from 'lucide-react'
import PrintActions from '@/components/PrintActions'

export const metadata = {
  title: 'Guía de estados — bachesuy.com',
}

const rows = [
  {
    status: 'Nuevo',
    duration: '0 a 7 días',
    automaticRule: 'Estado inicial automático al crear el reporte.',
    communityRule: 'No requiere votos previos.',
    notes: 'Visible en mapa como activo. Sirve para captar incidentes recientes y habilitar difusión temprana.',
  },
  {
    status: 'Confirmado',
    duration: 'Desde 3 confirmaciones o 7 días sin objeciones',
    automaticRule: 'Pasa automáticamente a confirmado si alcanza 3 confirmaciones válidas.',
    communityRule: 'Las personas pueden confirmarlo manualmente si el bache sigue existiendo.',
    notes: 'Sube la confiabilidad del caso y lo vuelve mejor candidato para reclamos formales o prensa.',
  },
  {
    status: 'Enviado',
    duration: 'Hasta 30 días o hasta cambio de resolución',
    automaticRule: 'Puede activarse al registrar que se generó denuncia formal o que el caso fue derivado.',
    communityRule: 'Puede marcarlo quien hizo el trámite, idealmente adjuntando constancia o enlace.',
    notes: 'No implica reparación; solo seguimiento institucional.',
  },
  {
    status: 'Reparado',
    duration: 'Estado visible durante 45 a 60 días',
    automaticRule: 'Se confirma cuando acumula al menos 3 marcaciones de reparación de usuarios distintos.',
    communityRule: 'La comunidad puede marcar “aparenta estar reparado”, pero no se publica como reparado hasta superar el umbral.',
    notes: 'Debe seguir figurando en el mapa en verde durante un período de observación.',
  },
  {
    status: 'Cerrado',
    duration: 'Estado final',
    automaticRule: 'Se usa para duplicados, errores evidentes o casos archivados tras observación.',
    communityRule: 'No debería quedar abierto a cambios masivos sin moderación.',
    notes: 'Conviene excluirlo de rankings activos, pero conservarlo en historial.',
  },
]

export default function StatusGuidePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="print-sheet max-w-4xl mx-auto px-6 py-8">
        <PrintActions />

        <div className="print-card rounded-3xl border border-slate-200 bg-white p-8">
          <div className="print-section border-b border-slate-200 pb-6 mb-6 flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                <FileText size={14} />
                Documento operativo
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Guía de estados de reportes</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Criterio recomendado para administrar el ciclo de vida de un bache reportado en bachesuy.com,
                incluyendo cambios automáticos, participación comunitaria y tratamiento visual en el mapa.
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Versión de trabajo</p>
              <p>{new Date().toLocaleDateString('es-UY')}</p>
            </div>
          </div>

          <div className="print-section grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Clock3 size={16} className="mb-2 text-sky-700" />
              <p className="text-sm font-semibold">Duración sugerida</p>
              <p className="mt-1 text-sm text-slate-600">Cada estado tiene una ventana de observación para evitar cambios apresurados.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <ShieldCheck size={16} className="mb-2 text-sky-700" />
              <p className="text-sm font-semibold">Validación comunitaria</p>
              <p className="mt-1 text-sm text-slate-600">Los cambios sensibles deberían depender de confirmaciones de múltiples personas.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Wrench size={16} className="mb-2 text-green-600" />
              <p className="text-sm font-semibold">Reparados en verde</p>
              <p className="mt-1 text-sm text-slate-600">Los casos reparados pueden seguir visibles en el mapa como evidencia de resolución.</p>
            </div>
          </div>

          <div className="print-section overflow-hidden rounded-3xl border border-slate-200 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-900">Estado</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Cuándo aplica</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Cambio automático</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Intervención humana</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Notas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.status} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-4 align-top font-semibold text-slate-900">{row.status}</td>
                    <td className="px-4 py-4 align-top text-slate-600">{row.duration}</td>
                    <td className="px-4 py-4 align-top text-slate-600">{row.automaticRule}</td>
                    <td className="px-4 py-4 align-top text-slate-600">{row.communityRule}</td>
                    <td className="px-4 py-4 align-top text-slate-600">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="print-section mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Flujo recomendado
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {['Nuevo', 'Confirmado', 'Enviado', 'Reparado', 'Cerrado'].map((item, index, array) => (
                <div key={item} className="inline-flex items-center gap-3">
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-800">
                    {item}
                  </span>
                  {index < array.length - 1 && <ArrowRight size={15} className="text-slate-400" />}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              El flujo puede volver de <strong>Reparado</strong> a <strong>Confirmado</strong> si reaparecen evidencias de que el problema continúa.
            </p>
          </div>

          <div className="print-section mb-8 rounded-2xl border border-sky-100 bg-sky-50/70 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-sky-700" />
              <div>
                <p className="font-semibold text-slate-900">Qué ya está contemplado en el mapa actual</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Los reportes con estado <strong>reparado</strong> ya usan color verde en el mapa.
                  La lógica actual del mapa ya contempla esa distinción y puede mantenerse cuando se agreguen
                  reglas automáticas más sofisticadas.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
