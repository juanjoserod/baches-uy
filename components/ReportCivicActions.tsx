'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink, FileText } from 'lucide-react'
import type { Report } from '@/types'
import { ROAD_TYPE_LABELS, STATUS_LABELS } from '@/types'
import { getDepartmentComplaintChannel } from '@/lib/department-complaints'
import { buildReportUrl, getPublicSiteUrl } from '@/lib/site-url'

interface ReportCivicActionsProps {
  report: Report
}

function buildComplaintText(report: Report, url: string) {
  return [
    'Quiero realizar una denuncia por un bache en la vía pública.',
    '',
    `Ubicación: ${report.address}, ${report.department}`,
    `Tipo de vía: ${ROAD_TYPE_LABELS[report.road_type]}`,
    `Estado del reporte ciudadano: ${STATUS_LABELS[report.status]}`,
    `Confirmaciones ciudadanas: ${report.confirmed_count}`,
    `Denuncias formales marcadas: ${report.sent_confirmed_count}`,
    report.description ? `Descripción: ${report.description}` : null,
    `Evidencia y fotos: ${url}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function ReportCivicActions({ report }: ReportCivicActionsProps) {
  const [copied, setCopied] = useState(false)
  const url = buildReportUrl(report.id, getPublicSiteUrl())
  const complaintChannel = getDepartmentComplaintChannel(report.department)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildComplaintText(report, url))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
      <h3 className="font-bold text-gray-900 mb-1">Denuncia formal y evidencia</h3>
      <p className="text-sm text-gray-500 mb-4">
        Abrir el enlace oficial no cambia el estado por sí solo. El estado <strong>Enviado</strong> debería marcarse cuando alguien efectivamente presenta la denuncia formal y luego lo registra en el reporte.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors ${
            copied
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Texto copiado' : 'Copiar denuncia'}
        </button>

        <a
          href={complaintChannel?.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors ${
            complaintChannel
              ? 'bg-sky-600 text-white hover:bg-sky-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
          }`}
          aria-disabled={!complaintChannel}
        >
          <ExternalLink size={16} />
          {complaintChannel?.label ?? 'Sin canal oficial cargado'}
        </a>

        <Link
          href={`/reporte/${report.id}/print`}
          target="_blank"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FileText size={16} />
          Descargar PDF
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        {complaintChannel && (
          <p className="text-xs text-gray-500 mb-3">
            Canal oficial para {report.department}:{' '}
            <span className="font-medium text-gray-700">
              {complaintChannel.kind === 'complaint_form' ? 'formulario o canal de reclamo' : 'contacto oficial general'}
            </span>
          </p>
        )}
        <p className="text-sm font-semibold text-gray-800 mb-2">Texto sugerido para pegar en la denuncia</p>
        <p className="text-sm whitespace-pre-line text-gray-600">{buildComplaintText(report, url)}</p>
      </div>
    </div>
  )
}
