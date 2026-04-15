export type RoadType = 'calle' | 'vereda' | 'ciclovia' | 'camino'
export type ReportStatus = 'nuevo' | 'confirmado' | 'enviado' | 'reparado' | 'cerrado'
export type ReportVoteType = 'confirm_exists' | 'confirm_sent' | 'confirm_repaired'
export type ReportCommentUpdateType =
  | 'still_there'
  | 'worse'
  | 'repaired_claim'
  | 'hazard'
  | 'formal_complaint'
  | 'general'

export interface Report {
  id: string
  created_at: string
  lat: number
  lng: number
  address: string
  department: string
  road_type: RoadType
  status: ReportStatus
  description: string | null
  photos: string[]
  confirmed_count: number
  sent_confirmed_count: number
  repair_confirmed_count: number
  status_updated_at: string | null
  sent_at: string | null
  repaired_at: string | null
}

export interface CreateReportInput {
  lat: number
  lng: number
  address: string
  department: string
  road_type: RoadType
  status: ReportStatus
  description: string | null
  email: string
  photos: string[]
}

export interface DepartmentCount {
  department: string
  count: number
}

export interface DepartmentComplaintChannel {
  department: string
  url: string
  label: string
  kind: 'complaint_form' | 'official_contact'
}

export interface ReportComment {
  id: string
  created_at: string
  report_id: string
  author_alias: string
  update_type: ReportCommentUpdateType
  body: string
  status: 'pending' | 'published' | 'hidden'
}

export const ROAD_TYPE_LABELS: Record<RoadType, string> = {
  calle: 'Calle',
  vereda: 'Vereda',
  ciclovia: 'Ciclovía',
  camino: 'Camino de tierra',
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  nuevo: 'Nuevo',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  reparado: 'Reparado',
  cerrado: 'Cerrado',
}

export const STATUS_COLORS: Record<ReportStatus, string> = {
  nuevo: 'bg-orange-100 text-orange-700 border-orange-200',
  confirmado: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  enviado: 'bg-blue-100 text-blue-700 border-blue-200',
  reparado: 'bg-green-100 text-green-700 border-green-200',
  cerrado: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const VOTE_TYPE_LABELS: Record<ReportVoteType, string> = {
  confirm_exists: 'Confirmar bache',
  confirm_sent: 'Marcar denuncia enviada',
  confirm_repaired: 'Marcar como reparado',
}

export const COMMENT_UPDATE_TYPE_LABELS: Record<ReportCommentUpdateType, string> = {
  still_there: 'Sigue igual',
  worse: 'Empeoró',
  repaired_claim: 'Parece reparado',
  hazard: 'Zona peligrosa',
  formal_complaint: 'Hice denuncia formal',
  general: 'Comentario general',
}

export const DEPARTMENTS = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
  'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
  'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
  'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres',
]
