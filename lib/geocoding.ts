const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const HEADERS = { 'User-Agent': 'BachesUY/1.0 (bachesuy.com)' }

export interface GeocodingResult {
  lat: number
  lng: number
  address: string
  department: string
}

export interface SearchSuggestion {
  lat: number
  lng: number
  display_name: string
  address: string
  department: string
}

// Convierte el nombre de estado/provincia de Nominatim al departamento uruguayo
function extractDepartment(nominatimAddress: Record<string, string>): string {
  const state = nominatimAddress.state ?? ''
  // Nominatim devuelve "Departamento de Montevideo" o "Montevideo Department"
  const match = state.match(/(?:Departamento\s+de\s+)?(.+?)(?:\s+Department)?$/i)
  return match?.[1] ?? state ?? 'Desconocido'
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&countrycodes=uy`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const data = await res.json()
    const addr = data.address ?? {}
    const road = addr.road ?? addr.pedestrian ?? addr.path ?? ''
    const houseNumber = addr.house_number ? ` ${addr.house_number}` : ''
    const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? ''
    const address = [road + houseNumber, city].filter(Boolean).join(', ') || data.display_name
    return {
      lat,
      lng,
      address,
      department: extractDepartment(addr),
    }
  } catch {
    return null
  }
}

export async function searchAddress(query: string): Promise<SearchSuggestion[]> {
  if (query.trim().length < 3) return []
  try {
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=uy&limit=5`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return []
    const data: Array<{
      lat: string
      lon: string
      display_name: string
      address: Record<string, string>
    }> = await res.json()
    return data.map((item) => {
      const addr = item.address
      const road = addr.road ?? addr.pedestrian ?? addr.path ?? ''
      const houseNumber = addr.house_number ? ` ${addr.house_number}` : ''
      const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? ''
      const address = [road + houseNumber, city].filter(Boolean).join(', ') || item.display_name
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
        address,
        department: extractDepartment(addr),
      }
    })
  } catch {
    return []
  }
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months} mes${months > 1 ? 'es' : ''}`
  return `hace ${Math.floor(months / 12)} año${Math.floor(months / 12) > 1 ? 's' : ''}`
}
