import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/server-supabase'
import {
  enforceSameOrigin,
  getClientIp,
  getHashedVoterFingerprint,
  rateLimit,
  tooManyRequestsResponse,
  verifyCsrf,
} from '@/lib/security'
import { hashCommentEmail, mapPublicReportComment } from '@/lib/report-comments'
import { validateCreateReportCommentInput, validateUuid } from '@/lib/validation'

function shouldAutoPublishComments() {
  const value = String(process.env.COMMENT_AUTO_PUBLISH ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase()

  return value === 'true'
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!validateUuid(id)) {
    return NextResponse.json({ error: 'Reporte inválido.' }, { status: 400 })
  }

  const supabase = getServerSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 })
  }

  try {
    const { data, error } = await supabase
      .from('report_comments')
      .select('id, created_at, report_id, author_alias, update_type, body, status')
      .eq('report_id', id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: 'No se pudieron cargar las actualizaciones.' }, { status: 500 })
    }

    return NextResponse.json((data ?? []).map((row) => mapPublicReportComment(row as Record<string, unknown>)), {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    })
  } catch {
    return NextResponse.json({ error: 'No se pudieron cargar las actualizaciones.' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!validateUuid(id)) {
    return NextResponse.json({ error: 'Reporte inválido.' }, { status: 400 })
  }

  if (!(await enforceSameOrigin(request)) || !(await verifyCsrf(request))) {
    return NextResponse.json({ error: 'Solicitud no autorizada.' }, { status: 403 })
  }

  const ip = await getClientIp()
  const limit = rateLimit({ key: `comment:${ip}:${id}`, limit: 3, windowMs: 10 * 60 * 1000 })
  if (!limit.success) {
    return tooManyRequestsResponse()
  }

  const supabase = getServerSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const parsed = validateCreateReportCommentInput(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { count, error: reportError } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('id', id)

    if (reportError || !count) {
      return NextResponse.json({ error: 'Reporte no encontrado.' }, { status: 404 })
    }

    const commenterHash = await getHashedVoterFingerprint()
    const status = shouldAutoPublishComments() ? 'published' : 'pending'

    const { data, error } = await supabase
      .from('report_comments')
      .insert({
        report_id: id,
        author_alias: parsed.data.author_alias,
        author_email_hash: hashCommentEmail(parsed.data.email),
        commenter_hash: commenterHash,
        update_type: parsed.data.update_type,
        body: parsed.data.body,
        status,
      })
      .select('id, created_at, report_id, author_alias, update_type, body, status')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'No se pudo guardar la actualización.' }, { status: 500 })
    }

    return NextResponse.json(mapPublicReportComment(data as Record<string, unknown>), { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }
}
