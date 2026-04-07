import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/server-supabase'
import { enforceSameOrigin, getClientIp, rateLimit, tooManyRequestsResponse, verifyCsrf } from '@/lib/security'
import { getReports, mapPublicReport } from '@/lib/supabase'
import { validateCreateReportInput } from '@/lib/validation'

export async function GET() {
  try {
    const reports = await getReports()
    return NextResponse.json(reports, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error fetching reports' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await enforceSameOrigin(request)) || !(await verifyCsrf(request))) {
    return NextResponse.json({ error: 'Solicitud no autorizada.' }, { status: 403 })
  }

  const ip = await getClientIp()
  const limit = rateLimit({ key: `report:${ip}`, limit: 8, windowMs: 15 * 60 * 1000 })
  if (!limit.success) {
    return tooManyRequestsResponse()
  }

  const supabase = getServerSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const parsed = validateCreateReportInput(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({ ...parsed.data, confirmed_count: 0 })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'No se pudo crear el reporte.' }, { status: 500 })
    }

    return NextResponse.json(mapPublicReport(data as Record<string, unknown>), { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }
}
