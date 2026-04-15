import { createClient } from '@supabase/supabase-js'
import type { Report, DepartmentCount, ReportComment, ReportCommentUpdateType } from '@/types'
import { getCsrfTokenFromDocument } from '@/lib/browser-security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function mapPublicReport(row: Record<string, unknown>): Report {
  return {
    id: String(row.id ?? ''),
    created_at: String(row.created_at ?? ''),
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    address: String(row.address ?? ''),
    department: String(row.department ?? ''),
    road_type: row.road_type as Report['road_type'],
    status: row.status as Report['status'],
    description: row.description == null ? null : String(row.description),
    photos: Array.isArray(row.photos) ? row.photos.map((item) => String(item)) : [],
    confirmed_count: Number(row.confirmed_count ?? 0),
    sent_confirmed_count: Number(row.sent_confirmed_count ?? 0),
    repair_confirmed_count: Number(row.repair_confirmed_count ?? 0),
    status_updated_at: row.status_updated_at == null ? null : String(row.status_updated_at),
    sent_at: row.sent_at == null ? null : String(row.sent_at),
    repaired_at: row.repaired_at == null ? null : String(row.repaired_at),
  }
}

export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => mapPublicReport(row as Record<string, unknown>))
}

export async function getReportById(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return mapPublicReport(data as Record<string, unknown>)
}

export async function getStats(): Promise<{ active: number; repaired: number; newCount: number }> {
  const { data, error } = await supabase
    .from('reports')
    .select('status')
  if (error) throw error
  const rows = data ?? []
  return {
    active: rows.filter((r) => r.status !== 'reparado' && r.status !== 'cerrado').length,
    repaired: rows.filter((r) => r.status === 'reparado').length,
    newCount: rows.filter((r) => r.status === 'nuevo').length,
  }
}

export async function getDepartmentCounts(): Promise<DepartmentCount[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('department')
    .not('status', 'in', '("reparado","cerrado")')
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.department] = (counts[row.department] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
}

export async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload-photo', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'x-csrf-token': getCsrfTokenFromDocument(),
    },
    body: formData,
  })

  const payload = (await response.json()) as { url?: string; error?: string }

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? 'No se pudo subir la imagen.')
  }

  return payload.url
}

export async function createReport(input: {
  lat: number
  lng: number
  address: string
  department: string
  road_type: Report['road_type']
  status: Report['status']
  description: string | null
  email: string
  photos: string[]
}): Promise<Report> {
  const response = await fetch('/api/reports', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfTokenFromDocument(),
    },
    body: JSON.stringify(input),
  })

  const payload = (await response.json()) as Report | { error?: string }
  if (!response.ok || !('id' in payload)) {
    throw new Error(('error' in payload && payload.error) || 'No se pudo crear el reporte.')
  }

  return payload
}

export async function castReportVote(id: string, voteType: 'confirm_exists' | 'confirm_sent' | 'confirm_repaired') {
  const response = await fetch(`/api/reports/${id}/vote`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfTokenFromDocument(),
    },
    body: JSON.stringify({ vote_type: voteType }),
  })

  const payload = (await response.json()) as { report?: Report; active?: boolean; error?: string }
  if (!response.ok || !payload.report) {
    throw new Error(payload.error ?? 'No se pudo confirmar el reporte.')
  }

  return {
    report: payload.report,
    active: Boolean(payload.active),
  }
}

export async function getReportComments(reportId: string): Promise<ReportComment[]> {
  const response = await fetch(`/api/reports/${reportId}/comments`, {
    credentials: 'same-origin',
    cache: 'no-store',
  })

  const payload = (await response.json()) as ReportComment[] | { error?: string }
  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(('error' in payload && payload.error) || 'No se pudieron cargar las actualizaciones.')
  }

  return payload
}

export async function createReportComment(input: {
  reportId: string
  author_alias: string
  email: string
  update_type: ReportCommentUpdateType
  body: string
}): Promise<ReportComment> {
  const response = await fetch(`/api/reports/${input.reportId}/comments`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfTokenFromDocument(),
    },
    body: JSON.stringify({
      author_alias: input.author_alias,
      email: input.email,
      update_type: input.update_type,
      body: input.body,
    }),
  })

  const payload = (await response.json()) as ReportComment | { error?: string }
  if (!response.ok || !('id' in payload)) {
    throw new Error(('error' in payload && payload.error) || 'No se pudo guardar la actualización.')
  }

  return payload
}
