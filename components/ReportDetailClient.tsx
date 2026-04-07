'use client'

import Link from 'next/link'
import { ArrowLeft, Bike, Car, Clock, MapPin, Mountain, PersonStanding, ThumbsUp } from 'lucide-react'
import type { Report, RoadType } from '@/types'
import { ROAD_TYPE_LABELS } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import ReportVotePanel from '@/components/ReportVotePanel'
import MapViewDynamic from '@/components/MapViewDynamic'
import PhotoLightbox from '@/components/PhotoLightbox'
import ReportCivicActions from '@/components/ReportCivicActions'
import SharePanel from '@/components/SharePanel'
import { timeAgo } from '@/lib/geocoding'
import { useState } from 'react'

const ROAD_ICONS: Record<RoadType, React.ReactNode> = {
  calle: <Car size={14} />,
  vereda: <PersonStanding size={14} />,
  ciclovia: <Bike size={14} />,
  camino: <Mountain size={14} />,
}

export default function ReportDetailClient({ report }: { report: Report }) {
  const [reportState, setReportState] = useState(report)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5">
        <ArrowLeft size={14} /> Volver al mapa
      </Link>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={reportState.status} />
        <span className="flex items-center gap-1.5 text-sm text-gray-600">
          {ROAD_ICONS[reportState.road_type]}
          {ROAD_TYPE_LABELS[reportState.road_type]}
        </span>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">{reportState.address}</h1>
      <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <MapPin size={13} /> {reportState.department} · <Clock size={13} /> {timeAgo(reportState.created_at)}
      </p>

      <div className="rounded-xl overflow-hidden border border-gray-200 mb-5" style={{ height: 260 }}>
        <MapViewDynamic
          reports={[reportState]}
          center={[reportState.lat, reportState.lng]}
          zoom={16}
        />
      </div>

      {reportState.photos && reportState.photos.length > 0 && (
        <PhotoLightbox photos={reportState.photos} />
      )}

      {reportState.description && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-gray-700">{reportState.description}</p>
        </div>
      )}

      <div className="flex items-center gap-5 text-sm text-gray-500 mb-5">
        <span className="flex items-center gap-1.5">
          <ThumbsUp size={14} /> {reportState.confirmed_count} confirmaciones
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={14} /> {reportState.sent_confirmed_count} denuncias formales
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} /> Reportado {timeAgo(reportState.created_at)}
        </span>
      </div>

      <div className="mb-5">
        <ReportVotePanel report={reportState} onReportChange={setReportState} />
      </div>

      <ReportCivicActions report={reportState} />

      <SharePanel reportId={reportState.id} address={reportState.address} department={reportState.department} />
    </div>
  )
}
