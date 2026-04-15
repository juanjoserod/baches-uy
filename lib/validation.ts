import type {
  CreateReportInput,
  ReportCommentUpdateType,
  ReportVoteType,
  RoadType,
  ReportStatus,
} from '@/types'

const ROAD_TYPES = new Set<RoadType>(['calle', 'vereda', 'ciclovia', 'camino'])
const REPORT_STATUSES = new Set<ReportStatus>(['nuevo', 'confirmado', 'enviado', 'reparado', 'cerrado'])
const REPORT_VOTE_TYPES = new Set<ReportVoteType>(['confirm_exists', 'confirm_sent', 'confirm_repaired'])
const REPORT_COMMENT_UPDATE_TYPES = new Set<ReportCommentUpdateType>([
  'still_there',
  'worse',
  'repaired_claim',
  'hazard',
  'formal_complaint',
  'general',
])

export function sanitizeText(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function hasLinkLikeText(value: string) {
  return /(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}\/)/i.test(value)
}

function isValidPhotoUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateCreateReportInput(input: unknown):
  | { success: true; data: CreateReportInput }
  | { success: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Solicitud inválida.' }
  }

  const payload = input as Record<string, unknown>
  const lat = Number(payload.lat)
  const lng = Number(payload.lng)
  const address = sanitizeText(String(payload.address ?? ''), 180)
  const department = sanitizeText(String(payload.department ?? ''), 80)
  const roadType = String(payload.road_type ?? '') as RoadType
  const status = String(payload.status ?? '') as ReportStatus
  const descriptionRaw = payload.description == null ? '' : String(payload.description)
  const description = sanitizeText(descriptionRaw, 1000)
  const email = sanitizeText(String(payload.email ?? ''), 160).toLowerCase()
  const photosRaw = Array.isArray(payload.photos) ? payload.photos : []

  if (!Number.isFinite(lat) || lat < -35.5 || lat > -30) {
    return { success: false, error: 'Latitud inválida.' }
  }
  if (!Number.isFinite(lng) || lng < -58.7 || lng > -53) {
    return { success: false, error: 'Longitud inválida.' }
  }
  if (address.length < 3) {
    return { success: false, error: 'Dirección inválida.' }
  }
  if (department.length < 2) {
    return { success: false, error: 'Departamento inválido.' }
  }
  if (!ROAD_TYPES.has(roadType)) {
    return { success: false, error: 'Tipo de vía inválido.' }
  }
  if (!REPORT_STATUSES.has(status)) {
    return { success: false, error: 'Estado inválido.' }
  }
  if (!isValidEmail(email)) {
    return { success: false, error: 'Email inválido.' }
  }

  const photos = photosRaw
    .slice(0, 3)
    .map((photo) => sanitizeText(String(photo), 500))

  if (photos.some((photo) => !isValidPhotoUrl(photo))) {
    return { success: false, error: 'Una de las URLs de foto es inválida.' }
  }

  return {
    success: true,
    data: {
      lat,
      lng,
      address,
      department,
      road_type: roadType,
      status,
      description: description || null,
      email,
      photos,
    },
  }
}

export function validateUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function validateVoteType(input: unknown):
  | { success: true; data: ReportVoteType }
  | { success: false; error: string } {
  const voteType = String(input ?? '') as ReportVoteType
  if (!REPORT_VOTE_TYPES.has(voteType)) {
    return { success: false, error: 'Tipo de voto inválido.' }
  }

  return { success: true, data: voteType }
}

export function validateCreateReportCommentInput(input: unknown):
  | {
    success: true
    data: {
      author_alias: string
      email: string
      update_type: ReportCommentUpdateType
      body: string
    }
  }
  | { success: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Solicitud inválida.' }
  }

  const payload = input as Record<string, unknown>
  const authorAlias = sanitizeText(String(payload.author_alias ?? ''), 40)
  const email = sanitizeText(String(payload.email ?? ''), 160).toLowerCase()
  const updateType = String(payload.update_type ?? '') as ReportCommentUpdateType
  const body = sanitizeText(String(payload.body ?? ''), 500)

  if (authorAlias.length < 2) {
    return { success: false, error: 'Ingresá un alias de al menos 2 caracteres.' }
  }
  if (!isValidEmail(email)) {
    return { success: false, error: 'Ingresá un email válido.' }
  }
  if (!REPORT_COMMENT_UPDATE_TYPES.has(updateType)) {
    return { success: false, error: 'Elegí un tipo de actualización válido.' }
  }
  if (body.length < 10) {
    return { success: false, error: 'La actualización debe tener al menos 10 caracteres.' }
  }
  if (hasLinkLikeText(body)) {
    return { success: false, error: 'Por seguridad, las actualizaciones no pueden incluir links.' }
  }

  return {
    success: true,
    data: {
      author_alias: authorAlias,
      email,
      update_type: updateType,
      body,
    },
  }
}
