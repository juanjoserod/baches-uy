import { NextResponse } from 'next/server'
import {
  answerTelegramCallback,
  applyTelegramModerationAction,
  editTelegramMessageReplyMarkup,
  isValidTelegramWebhookSecret,
  parseTelegramCallbackData,
} from '@/lib/telegram'
import { validateUuid } from '@/lib/validation'

type TelegramWebhookPayload = {
  callback_query?: {
    id: string
    data?: string
    from?: {
      id: number
      username?: string
    }
    message?: {
      message_id: number
      chat?: {
        id: number
      }
    }
  }
}

export async function POST(request: Request) {
  const secretHeader = request.headers.get('x-telegram-bot-api-secret-token')
  if (!isValidTelegramWebhookSecret(secretHeader)) {
    return NextResponse.json({ error: 'Solicitud no autorizada.' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as TelegramWebhookPayload
    const callback = body.callback_query
    if (!callback?.id || !callback.data) {
      return NextResponse.json({ ok: true })
    }

    const parsed = parseTelegramCallbackData(callback.data)
    if (!parsed || !validateUuid(parsed.reportId)) {
      await answerTelegramCallback(callback.id, 'Acción inválida.')
      return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 })
    }

    const actor = callback.from?.username
      ? `telegram:${callback.from.username}`
      : `telegram:${callback.from?.id ?? 'unknown'}`

    await applyTelegramModerationAction(parsed.reportId, parsed.action, actor)

    if (callback.message?.chat?.id && callback.message?.message_id) {
      await editTelegramMessageReplyMarkup(
        String(callback.message.chat.id),
        String(callback.message.message_id),
        parsed.action
      )
    }

    await answerTelegramCallback(callback.id, 'Acción registrada.')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar el webhook de Telegram.' }, { status: 500 })
  }
}
