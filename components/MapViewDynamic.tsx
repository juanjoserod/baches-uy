'use client'

import dynamic from 'next/dynamic'
import type { MapViewProps } from './MapView'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function MapViewDynamic(props: MapViewProps) {
  return <MapView {...props} />
}
