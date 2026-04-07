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
import { registerReportVote } from '@/lib/server-report-votes'
import { validateUuid } from '@/lib/validation'

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
  const limit = rateLimit({ key: `confirm:${ip}:${id}`, limit: 5, windowMs: 10 * 60 * 1000 })
  if (!limit.success) {
    return tooManyRequestsResponse()
  }

  const supabase = getServerSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 })
  }

  const voterHash = await getHashedVoterFingerprint()
  const result = await registerReportVote({
    supabase,
    reportId: id,
    voteType: 'confirm_exists',
    voterHash,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({
    confirmed_count: result.report.confirmed_count,
    report: result.report,
    active: result.active,
  })
}
