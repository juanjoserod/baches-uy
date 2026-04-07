import { NextResponse } from 'next/server'
import { enforceSameOrigin, getClientIp, rateLimit, tooManyRequestsResponse, verifyCsrf } from '@/lib/security'
import { getServerSupabase } from '@/lib/server-supabase'

const MAX_FILE_SIZE = 8 * 1024 * 1024

export async function POST(request: Request) {
  try {
    if (!(await enforceSameOrigin(request)) || !(await verifyCsrf(request))) {
      return NextResponse.json({ error: 'Solicitud no autorizada.' }, { status: 403 })
    }

    const ip = await getClientIp()
    const limit = rateLimit({ key: `upload:${ip}`, limit: 12, windowMs: 15 * 60 * 1000 })
    if (!limit.success) {
      return tooManyRequestsResponse()
    }

    const supabase = getServerSupabase()

    if (!supabase) {
      return NextResponse.json(
        {
          error:
            'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor para permitir subida de fotos.',
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ninguna imagen.' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'La imagen supera el máximo permitido de 8 MB.' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return NextResponse.json({ error: 'Formato de imagen no permitido.' }, { status: 400 })
    }
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('report-photos')
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage.from('report-photos').getPublicUrl(path)

    return NextResponse.json({ url: data.publicUrl })
  } catch {
    return NextResponse.json({ error: 'No se pudo subir la imagen.' }, { status: 500 })
  }
}
