export function getCsrfTokenFromDocument() {
  if (typeof document === 'undefined') return ''

  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}
