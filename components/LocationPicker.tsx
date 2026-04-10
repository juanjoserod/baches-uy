'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { searchAddress, reverseGeocode, type SearchSuggestion } from '@/lib/geocoding'

interface LocationPickerProps {
  onSelect: (lat: number, lng: number, address: string, department: string) => void
  initialLat?: number
  initialLng?: number
  searchInputId?: string
  searchInputName?: string
}

export default function LocationPicker({
  onSelect,
  initialLat,
  initialLng,
  searchInputId = 'location-search',
  searchInputName = 'location_search',
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((containerRef.current as any)._leaflet_id) return
    let isMounted = true

    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((containerRef.current as any)._leaflet_id) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: initialLat && initialLng ? [initialLat, initialLng] : [-34.9, -56.2],
        zoom: initialLat ? 16 : 12,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      if (initialLat && initialLng) {
        placeMarker(L, map, initialLat, initialLng)
      }

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng
        placeMarker(L, map, lat, lng)
        const result = await reverseGeocode(lat, lng)
        if (result) {
          onSelect(lat, lng, result.address, result.department)
        } else {
          onSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`, 'Desconocido')
        }
      })
    })

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function placeMarker(L: typeof import('leaflet'), map: LeafletMap, lat: number, lng: number) {
    const icon = L.divIcon({
      html: `<div style="width:22px;height:22px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map)
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const results = await searchAddress(value)
      setSuggestions(results)
      setLoading(false)
    }, 400)
  }

  async function handleSelectSuggestion(s: SearchSuggestion) {
    setSuggestions([])
    setQuery(s.address)
    onSelect(s.lat, s.lng, s.address, s.department)
    if (mapRef.current) {
      const L = await import('leaflet')
      placeMarker(L, mapRef.current, s.lat, s.lng)
      mapRef.current.setView([s.lat, s.lng], 17)
    }
  }

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-2 z-[1200]">
        <input
          id={searchInputId}
          name={searchInputName}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Calle, número, ciudad..."
          autoComplete="street-address"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            Buscando...
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2">O hacé clic directamente en el mapa para marcar el bache</p>
      {/* Map */}
      <div className="relative z-0" style={{ height: 320 }}>
        {suggestions.length > 0 && (
          <div className="absolute inset-x-3 top-3 z-[1200]">
            <ul className="max-h-56 overflow-y-auto rounded-2xl border border-gray-200 bg-white text-sm shadow-[0_16px_40px_rgba(16,33,51,0.18)]">
      <div className="relative z-0 rounded-xl overflow-hidden border border-gray-200" style={{ height: 320 }}>
        {suggestions.length > 0 && (
          <div className="absolute inset-x-3 top-3 z-[1200]">
            <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm shadow-[0_16px_40px_rgba(16,33,51,0.18)]">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-800 truncate">{s.address}</p>
                    <p className="text-xs text-gray-500 truncate">{s.department}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-xl overflow-hidden border border-gray-200 w-full h-full">
          <div ref={containerRef} className="w-full h-full" />
        </div>
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
