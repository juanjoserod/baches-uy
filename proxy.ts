import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function buildCsp() {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.supabase.co https://unpkg.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
    "connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org https://fonts.googleapis.com",
    "worker-src 'self' blob:",
  ].join('; ')
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const isProduction = process.env.NODE_ENV === 'production'

  if (!request.cookies.get('csrf_token')) {
    response.cookies.set('csrf_token', crypto.randomUUID(), {
      httpOnly: false,
      sameSite: 'strict',
      secure: isProduction,
      path: '/',
    })
  }

  response.headers.set('Content-Security-Policy', buildCsp())
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  if (isProduction) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
