import { NextResponse } from 'next/server'
import { queueReportForTelegramReview, isValidAdminActionsToken } from '@/lib/telegram'
import { validateUuid } from '@/lib/validation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminToken = request.headers.get('x-admin-token')
  if (!isValidAdminActionsToken(adminToken)) {
    return NextResponse.json({ error: 'Solicitud no autorizada.' }, { status: 401 })
  }

  const { id } = await params
  if (!validateUuid(id)) {
    return NextResponse.json({ error: 'Reporte inválido.' }, { status: 400 })
  }

  try {
    const result = await queueReportForTelegramReview(id)
    return NextResponse.json({
      ok: true,
      telegram_chat_id: result.chatId,
      telegram_message_id: result.messageId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo enviar el reporte a Telegram.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
