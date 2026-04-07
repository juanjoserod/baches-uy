'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { Report } from '@/types'
import { STATUS_LABELS, ROAD_TYPE_LABELS } from '@/types'
import { timeAgo } from '@/lib/geocoding'
import { escapeHtml } from '@/lib/validation'

const STATUS_DOT: Record<string, string> = {
  nuevo: '#2483d8',
  confirmado: '#5aa8ee',
  enviado: '#0f4f88',
  reparado: '#22c55e',
  cerrado: '#9ca3af',
}

export interface MapViewProps {
  reports: Report[]
  center?: [number, number]
  zoom?: number
  onMapClick?: (lat: number, lng: number) => void
  selectedLat?: number
  selectedLng?: number
  onMapReady?: (map: LeafletMap) => void
}

export default function MapView({
  reports,
  center = [-32.5, -55.7],
  zoom = 7,
  onMapClick,
  selectedLat,
  selectedLng,
  onMapReady,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const reportLayerRef = useRef<import('leaflet').LayerGroup | null>(null)
  const pinMarkerRef = useRef<import('leaflet').Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((containerRef.current as any)._leaflet_id) return

    let isMounted = true

    async function init() {
      if (!isMounted || !containerRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((containerRef.current as any)._leaflet_id) return

      const L = await import('leaflet')

      if (!isMounted || !containerRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((containerRef.current as any)._leaflet_id) return

      // Fix Leaflet default icon paths (next.js asset handling)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center,
        zoom,
        scrollWheelZoom: true,
        zoomControl: false,
      })

      L.control.zoom({ position: 'topright' }).addTo(map)

      // CartoDB Positron — base limpia con aire editorial
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      onMapReady?.(map)
      window.setTimeout(() => map.invalidateSize(), 0)

      const reportLayer = L.layerGroup().addTo(map)
      reportLayerRef.current = reportLayer

      function createReportMarker(report: Report) {
        const color = STATUS_DOT[report.status] ?? '#2483d8'
        const safeStatus = escapeHtml(STATUS_LABELS[report.status as keyof typeof STATUS_LABELS])
        const safeRoadType = escapeHtml(ROAD_TYPE_LABELS[report.road_type as keyof typeof ROAD_TYPE_LABELS])
        const safeAddress = escapeHtml(report.address)
        const safeDepartment = escapeHtml(report.department)
        const safeDescription = report.description
          ? escapeHtml(report.description.slice(0, 90)) + (report.description.length > 90 ? '…' : '')
          : ''
        const icon = L.divIcon({
          html: `<div style="width:13px;height:13px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(16,33,51,0.24)"></div>`,
          className: '',
          iconSize: [13, 13],
          iconAnchor: [6, 6],
        })

        const marker = L.marker([report.lat, report.lng], { icon })
        marker.bindPopup(
          `<div style="min-width:190px;font-family:-apple-system,sans-serif;line-height:1.4">
            <div style="font-size:11px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${safeStatus}</div>
            <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:2px">${safeRoadType} — ${safeAddress}</div>
            <div style="font-size:11px;color:#666;margin-bottom:7px">${safeDepartment}</div>
            ${report.description ? `<div style="font-size:12px;color:#444;background:#f9f9f9;padding:6px 8px;border-radius:6px;margin-bottom:7px">${safeDescription}</div>` : ''}
            <div style="font-size:11px;color:#888;margin-bottom:8px">✓ ${report.confirmed_count} confirmaciones · ${timeAgo(report.created_at)}</div>
            <a href="/reporte/${report.id}" style="display:block;text-align:center;background:#111827;color:white;padding:6px 10px;border-radius:8px;font-size:12px;text-decoration:none;font-weight:600">Ver reporte →</a>
          </div>`,
          { maxWidth: 220 }
        )

        return marker
      }

      function createClusterMarker(group: Report[]) {
        const avgLat = group.reduce((sum, report) => sum + report.lat, 0) / group.length
        const avgLng = group.reduce((sum, report) => sum + report.lng, 0) / group.length
        const count = group.length
        const size = count >= 50 ? 78 : count >= 20 ? 66 : count >= 10 ? 56 : count >= 5 ? 48 : 40
        const icon = L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:#102133;border:4px solid #56aef6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#f8fbff;font-size:${size >= 64 ? 18 : 15}px;font-weight:700;box-shadow:0 10px 28px rgba(16,33,51,0.22)">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const marker = L.marker([avgLat, avgLng], { icon })
        marker.on('click', () => {
          const bounds = L.latLngBounds(group.map((report) => [report.lat, report.lng] as [number, number]))
          map.fitBounds(bounds.pad(0.35), { maxZoom: Math.max(map.getZoom() + 2, 16) })
        })

        return marker
      }

      function renderGroupedMarkers() {
        reportLayer.clearLayers()

        if (reports.length === 0) return

        const currentZoom = map.getZoom()
        const cellSize =
          currentZoom >= 16 ? 0 :
          currentZoom >= 14 ? 34 :
          currentZoom >= 12 ? 46 :
          currentZoom >= 10 ? 58 :
          72

        if (cellSize === 0) {
          for (const report of reports) {
            reportLayer.addLayer(createReportMarker(report))
          }
          return
        }

        const buckets = new Map<string, Report[]>()

        for (const report of reports) {
          const point = map.project([report.lat, report.lng], currentZoom)
          const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`
          const bucket = buckets.get(key)
          if (bucket) {
            bucket.push(report)
          } else {
            buckets.set(key, [report])
          }
        }

        for (const group of buckets.values()) {
          if (group.length === 1) {
            reportLayer.addLayer(createReportMarker(group[0]))
          } else {
            reportLayer.addLayer(createClusterMarker(group))
          }
        }
      }

      renderGroupedMarkers()
      map.on('zoomend moveend', renderGroupedMarkers)
      map.on('load', () => map.invalidateSize())

      if (onMapClick) {
        map.on('click', (e) => onMapClick(e.latlng.lat, e.latlng.lng))
      }
    }

    init()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.off('zoomend')
        mapRef.current.off('moveend')
        mapRef.current.remove()
        mapRef.current = null
        reportLayerRef.current = null
        pinMarkerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualizar pin del LocationPicker cuando cambian las coords
  useEffect(() => {
    if (!mapRef.current || selectedLat === undefined || selectedLng === undefined) return
    import('leaflet').then((L) => {
      if (!mapRef.current) return
      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLatLng([selectedLat, selectedLng])
      } else {
        const icon = L.divIcon({
          html: `<div style="width:22px;height:22px;background:#2483d8;border:3px solid white;border-radius:50%;box-shadow:0 8px 18px rgba(23,106,182,0.28)"></div>`,
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })
        pinMarkerRef.current = L.marker([selectedLat, selectedLng], { icon }).addTo(mapRef.current!)
      }
      mapRef.current!.setView([selectedLat, selectedLng], Math.max(mapRef.current!.getZoom(), 16))
    })
  }, [selectedLat, selectedLng])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 300 }}
    />
  )
}
