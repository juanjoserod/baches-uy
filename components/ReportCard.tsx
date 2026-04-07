import Link from 'next/link'
import { ThumbsUp, Clock, ChevronRight, Car, PersonStanding, Bike, Mountain } from 'lucide-react'
import type { Report, RoadType } from '@/types'
import { ROAD_TYPE_LABELS } from '@/types'
import StatusBadge from './StatusBadge'
import { timeAgo } from '@/lib/geocoding'

const ROAD_ICONS: Record<RoadType, React.ReactNode> = {
  calle: <Car size={12} />,
  vereda: <PersonStanding size={12} />,
  ciclovia: <Bike size={12} />,
  camino: <Mountain size={12} />,
}

export default function ReportCard({ report }: { report: Report }) {
  const thumb = report.photos?.[0]

  return (
    <Link
      href={`/reporte/${report.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="flex">
        {thumb && (
          <div className="w-24 h-24 shrink-0 overflow-hidden">
            <img src={thumb} alt="Foto del bache" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <StatusBadge status={report.status} />
            <span className="flex items-center gap-1 text-xs text-gray-500">
              {ROAD_ICONS[report.road_type]}
              {ROAD_TYPE_LABELS[report.road_type]}
            </span>
          </div>
          <p className="font-semibold text-gray-900 truncate text-sm">{report.address}</p>
          <p className="text-xs text-gray-500 truncate">{report.department}</p>
          {report.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{report.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ThumbsUp size={11} /> {report.confirmed_count}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {timeAgo(report.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center pr-3 text-gray-400">
          <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  )
}
