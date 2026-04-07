import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

type RateLimitBucket = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitBucket>()

export async function getClientIp() {
  const headerList = await headers()
  const forwardedFor = headerList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return headerList.get('x-real-ip') ?? 'unknown'
}

export async function getHashedVoterFingerprint() {
  const headerList = await headers()
  const ip = await getClientIp()
  const userAgent = headerList.get('user-agent') ?? 'unknown'
  const salt = process.env.VOTE_FINGERPRINT_SALT ?? 'baches-uy-fallback-salt'

  return createHash('sha256')
    .update(`${salt}:${ip}:${userAgent}`)
    .digest('hex')
}

export async function enforceSameOrigin(request: Request) {
  const headerList = await headers()
  const origin = request.headers.get('origin')
  const host = headerList.get('host')

  if (!origin || !host) return false

  try {
    const originUrl = new URL(origin)
    return originUrl.host === host
  } catch {
    return false
  }
}

export async function verifyCsrf(request: Request) {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get('csrf_token')?.value
  const headerToken = request.headers.get('x-csrf-token')

  return Boolean(cookieToken && headerToken && cookieToken === headerToken)
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true as const }
  }

  if (existing.count >= limit) {
    return { success: false as const, retryAfterMs: existing.resetAt - now }
  }

  existing.count += 1
  return { success: true as const }
}

export function tooManyRequestsResponse() {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Intentá nuevamente en unos minutos.' },
    { status: 429 }
  )
}
