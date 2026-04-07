import { notFound } from 'next/navigation'
import { AlertTriangle, FileText, MapPin, ShieldCheck } from 'lucide-react'
import PrintActions from '@/components/PrintActions'
import { getReportById } from '@/lib/supabase'
import { ROAD_TYPE_LABELS, STATUS_LABELS } from '@/types'
import { buildReportUrl, getPublicSiteUrl } from '@/lib/site-url'

export const metadata = {
  title: 'Constancia de reporte — baches.uy',
}

export default async function ReportPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getReportById(id)
  const reportUrl = buildReportUrl(id, getPublicSiteUrl())

  if (!report) notFound()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="print-sheet max-w-3xl mx-auto px-6 py-8">
        <PrintActions />

        <div className="print-card rounded-3xl border border-gray-200 p-8 bg-white">
          <div className="print-section flex items-start justify-between gap-6 border-b border-gray-200 pb-6 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700 mb-2">
                Constancia ciudadana
              </p>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 print:bg-transparent print:border print:border-sky-200">
                  <FileText size={20} />
                </span>
                Reporte de bache
              </h1>
              <p className="text-sm text-gray-500 mt-3 max-w-xl">
                Documento de respaldo para reclamos formales, constancia vecinal o difusión periodística.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-1">Reporte</p>
              <p className="font-mono text-sm">{report.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="print-section grid gap-4 sm:grid-cols-2 mb-6 text-sm">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-gray-500 mb-2 flex items-center gap-2"><MapPin size={14} className="text-sky-600" />Ubicación</p>
              <p className="font-semibold">{report.address}</p>
              <p className="text-gray-600">{report.department}</p>
              <p className="text-gray-600 mt-2">
                Coordenadas: {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-gray-500 mb-2 flex items-center gap-2"><ShieldCheck size={14} className="text-sky-600" />Estado y contexto</p>
              <p className="font-semibold">{STATUS_LABELS[report.status]}</p>
              <p className="text-gray-600">Tipo de vía: {ROAD_TYPE_LABELS[report.road_type]}</p>
              <p className="text-gray-600 mt-2">Confirmaciones: {report.confirmed_count}</p>
            </div>
          </div>

          <div className="print-section mb-6">
            <h2 className="text-sm uppercase tracking-[0.18em] text-gray-400 mb-2">Descripción</h2>
            <div className="rounded-2xl border border-gray-200 p-4 bg-white">
              <p className="text-sm text-gray-700">
                {report.description?.trim() || 'No se agregó una descripción adicional.'}
              </p>
            </div>
          </div>

          {report.photos.length > 0 && (
            <div className="print-section mb-6">
              <h2 className="text-sm uppercase tracking-[0.18em] text-gray-400 mb-3">Fotos adjuntas</h2>
              <div className="print-photos grid gap-3 sm:grid-cols-2">
                {report.photos.map((url, index) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Foto del reporte ${index + 1}`}
                    className="w-full h-56 object-cover rounded-2xl border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="print-section rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 mb-6 text-xs text-slate-600 flex items-start gap-3">
            <AlertTriangle size={15} className="text-sky-700 mt-0.5 shrink-0" />
            <div className="leading-5">
              Esta constancia refleja la información pública disponible en baches.uy al momento de la emisión. No reemplaza la denuncia formal ante el organismo competente.
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5 text-xs text-gray-500 flex flex-col gap-1">
            <p><strong>Generado por:</strong> baches.uy</p>
            <p><strong>Fecha de emisión:</strong> {new Date().toLocaleString('es-UY')}</p>
            <p><strong>Enlace del reporte:</strong> {reportUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
