import { createHash, timingSafeEqual } from 'crypto'
import { getServerSupabase } from '@/lib/server-supabase'
import { buildReportUrl, getPublicSiteUrl } from '@/lib/site-url'

type TelegramInlineKeyboardButton = {
  text: string
  callback_data: string
}

type TelegramApiResponse<T> = {
  ok: boolean
  result?: T
  description?: string
}

type TelegramMessageResult = {
  message_id: number
  chat: {
    id: number
  }
}

type RawReportRow = {
  id: string
  address: string
  department: string
  description: string | null
  photos: string[] | null
  email: string
  road_type: string
  created_at: string
  status: string
}

export type TelegramModerationAction = 'approved' | 'rejected' | 'needs_review'

const TELEGRAM_ACTION_PREFIX = 'report_review'

function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN
}

function getTelegramAdminChatId() {
  return process.env.TELEGRAM_ADMIN_CHAT_ID
}

function getTelegramWebhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET
}

export function maskEmail(email: string) {
  const [localPart = '', domain = ''] = email.split('@')
  if (!localPart || !domain) return email

  const safeLocal =
    localPart.length <= 2
      ? `${localPart[0] ?? '*'}*`
      : `${localPart.slice(0, 2)}***`

  return `${safeLocal}@${domain}`
}

function buildCallbackData(action: TelegramModerationAction, reportId: string) {
  return `${TELEGRAM_ACTION_PREFIX}:${action}:${reportId}`
}

export function parseTelegramCallbackData(value: string) {
  const [prefix, action, reportId] = value.split(':')
  if (prefix !== TELEGRAM_ACTION_PREFIX) return null
  if (!reportId) return null
  if (action !== 'approved' && action !== 'rejected' && action !== 'needs_review') return null

  return {
    action,
    reportId,
  } satisfies { action: TelegramModerationAction; reportId: string }
}

function buildInlineKeyboard(reportId: string): TelegramInlineKeyboardButton[][] {
  return [[
    { text: 'Aprobar', callback_data: buildCallbackData('approved', reportId) },
    { text: 'Rechazar', callback_data: buildCallbackData('rejected', reportId) },
    { text: 'Revisar', callback_data: buildCallbackData('needs_review', reportId) },
  ]]
}

function buildModerationText(report: RawReportRow) {
  const reportUrl = buildReportUrl(report.id, getPublicSiteUrl())
  const createdAt = new Date(report.created_at).toLocaleString('es-UY')

  return [
    'Nuevo reporte para moderación',
    '',
    `ID: ${report.id}`,
    `Ubicación: ${report.address}, ${report.department}`,
    `Tipo de vía: ${report.road_type}`,
    `Estado actual: ${report.status}`,
    `Email: ${maskEmail(report.email)}`,
    `Fecha: ${createdAt}`,
    report.description ? `Descripción: ${report.description}` : null,
    `Ver reporte: ${reportUrl}`,
  ]
    .filter(Boolean)
    .join('\n')
}

async function callTelegramApi<T>(method: string, payload: Record<string, unknown>) {
  const token = getTelegramBotToken()
  if (!token) {
    throw new Error('Falta TELEGRAM_BOT_TOKEN en el servidor.')
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as TelegramApiResponse<T>
  if (!response.ok || !data.ok || !data.result) {
    throw new Error(data.description ?? 'No se pudo contactar a Telegram.')
  }

  return data.result
}

export function isValidTelegramWebhookSecret(secretHeader: string | null) {
  const expected = getTelegramWebhookSecret()
  if (!expected || !secretHeader) return false

  const providedBuffer = Buffer.from(secretHeader)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export function isValidAdminActionsToken(tokenHeader: string | null) {
  const expected = process.env.ADMIN_ACTIONS_TOKEN
  if (!expected || !tokenHeader) return false

  const providedBuffer = Buffer.from(tokenHeader)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export async function getReportForModeration(reportId: string) {
  const supabase = getServerSupabase()
  if (!supabase) {
    throw new Error('Configuración del servidor incompleta.')
  }

  const { data, error } = await supabase
    .from('reports')
    .select('id,address,department,description,photos,email,road_type,created_at,status')
    .eq('id', reportId)
    .single()

  if (error || !data) {
    throw new Error('No se encontró el reporte.')
  }

  return data as RawReportRow
}

export async function queueReportForTelegramReview(reportId: string) {
  const supabase = getServerSupabase()
  if (!supabase) {
    throw new Error('Configuración del servidor incompleta.')
  }

  const report = await getReportForModeration(reportId)
  const chatId = getTelegramAdminChatId()
  if (!chatId) {
    throw new Error('Falta TELEGRAM_ADMIN_CHAT_ID en el servidor.')
  }

  const keyboard = buildInlineKeyboard(reportId)
  const text = buildModerationText(report)
  const firstPhoto = report.photos?.[0]

  const telegramResult = firstPhoto
    ? await callTelegramApi<TelegramMessageResult>('sendPhoto', {
        chat_id: chatId,
        photo: firstPhoto,
        caption: text,
        reply_markup: { inline_keyboard: keyboard },
      })
    : await callTelegramApi<TelegramMessageResult>('sendMessage', {
        chat_id: chatId,
        text,
        reply_markup: { inline_keyboard: keyboard },
      })

  const now = new Date().toISOString()

  const { error: reportError } = await supabase
    .from('reports')
    .update({
      visibility_status: 'pending_admin_review',
      admin_review_status: 'pending',
      telegram_chat_id: String(telegramResult.chat.id),
      telegram_message_id: String(telegramResult.message_id),
    })
    .eq('id', reportId)

  if (reportError) {
    throw new Error('No se pudo actualizar el estado de moderación del reporte.')
  }

  const { error: reviewError } = await supabase
    .from('report_admin_reviews')
    .insert({
      report_id: reportId,
      channel: 'telegram',
      action: 'queued',
      actor: 'telegram_bot',
      telegram_chat_id: String(telegramResult.chat.id),
      telegram_message_id: String(telegramResult.message_id),
      note: `Enviado a moderación por Telegram el ${now}.`,
    })

  if (reviewError) {
    throw new Error('No se pudo registrar la cola de moderación en Telegram.')
  }

  return {
    messageId: telegramResult.message_id,
    chatId: telegramResult.chat.id,
  }
}

export async function applyTelegramModerationAction(
  reportId: string,
  action: TelegramModerationAction,
  actor: string
) {
  const supabase = getServerSupabase()
  if (!supabase) {
    throw new Error('Configuración del servidor incompleta.')
  }

  const now = new Date().toISOString()
  const update =
    action === 'approved'
      ? {
          visibility_status: 'published',
          admin_review_status: 'approved',
          admin_reviewed_at: now,
          admin_reviewed_by: actor,
          published_at: now,
          rejection_reason: null,
        }
      : action === 'rejected'
        ? {
            visibility_status: 'rejected',
            admin_review_status: 'rejected',
            admin_reviewed_at: now,
            admin_reviewed_by: actor,
            rejection_reason: 'Rechazado desde Telegram.',
          }
        : {
            visibility_status: 'pending_admin_review',
            admin_review_status: 'needs_review',
            admin_reviewed_at: now,
            admin_reviewed_by: actor,
          }

  const { error: reportError } = await supabase
    .from('reports')
    .update(update)
    .eq('id', reportId)

  if (reportError) {
    throw new Error('No se pudo actualizar el estado del reporte.')
  }

  const { error: reviewError } = await supabase
    .from('report_admin_reviews')
    .insert({
      report_id: reportId,
      channel: 'telegram',
      action,
      actor,
      note: `Acción aplicada desde Telegram: ${action}.`,
    })

  if (reviewError) {
    throw new Error('No se pudo registrar la revisión administrativa.')
  }
}

export async function answerTelegramCallback(callbackQueryId: string, text: string) {
  await callTelegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  })
}

export async function editTelegramMessageReplyMarkup(chatId: string, messageId: string, action: TelegramModerationAction) {
  const label =
    action === 'approved'
      ? 'Aprobado'
      : action === 'rejected'
        ? 'Rechazado'
        : 'Marcado para revisión'

  await callTelegramApi('editMessageReplyMarkup', {
    chat_id: chatId,
    message_id: Number(messageId),
    reply_markup: {
      inline_keyboard: [[{ text: `Estado: ${label}`, callback_data: 'noop' }]],
    },
  })
}

export function buildVerificationTokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
