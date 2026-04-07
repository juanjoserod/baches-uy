const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://baches.uy'

function normalizeBaseUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function getPublicSiteUrl() {
  return normalizeBaseUrl(PUBLIC_SITE_URL)
}

export function buildReportUrl(reportId: string, origin?: string) {
  const baseUrl = normalizeBaseUrl(origin || PUBLIC_SITE_URL)
  return `${baseUrl}/reporte/${reportId}`
}
