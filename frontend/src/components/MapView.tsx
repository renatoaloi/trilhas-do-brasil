import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Pivot } from '../services/types'
import { reputationColor } from '../utils/format'
import 'leaflet/dist/leaflet.css'

const defaultCenter: [number, number] = [-15.78, -47.93]

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:0;height:0;
    border-left:8px solid transparent;
    border-right:8px solid transparent;
    border-bottom:16px solid #e07a3d;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,.5));
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 16],
})

type Bounds = {
  min_lat: number
  max_lat: number
  min_lng: number
  max_lng: number
}

export type RadiusOverlay = {
  lat: number
  lng: number
  radiusKm: number
}

type Props = {
  pivots: Pivot[]
  onSelect: (pivot: Pivot) => void
  onBoundsChange?: (bounds: Bounds) => void
  onPlaceRequest?: (coords: { lat: number; lng: number }) => void
  radiusOverlay?: RadiusOverlay | null
  center?: { lat: number; lng: number } | null
  height?: string
}

function BoundsWatcher({ onBoundsChange }: { onBoundsChange?: (b: Bounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (!onBoundsChange) return
      const b = map.getBounds()
      onBoundsChange({
        min_lat: b.getSouth(),
        max_lat: b.getNorth(),
        min_lng: b.getWest(),
        max_lng: b.getEast(),
      })
    },
    zoomend: () => {
      if (!onBoundsChange) return
      const b = map.getBounds()
      onBoundsChange({
        min_lat: b.getSouth(),
        max_lat: b.getNorth(),
        min_lng: b.getWest(),
        max_lng: b.getEast(),
      })
    },
  })

  useEffect(() => {
    if (!onBoundsChange) return
    const b = map.getBounds()
    onBoundsChange({
      min_lat: b.getSouth(),
      max_lat: b.getNorth(),
      min_lng: b.getWest(),
      max_lng: b.getEast(),
    })
  }, [map, onBoundsChange])

  return null
}

function PlaceClickHandler({
  onPlaceRequest,
}: {
  onPlaceRequest?: (coords: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    dblclick: (e) => {
      if (!onPlaceRequest) return
      onPlaceRequest({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true })
  }, [center, map])
  return null
}

export function MapView({
  pivots,
  onSelect,
  onBoundsChange,
  onPlaceRequest,
  radiusOverlay,
  center,
  height = '100%',
}: Props) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPos(null),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  const mapCenter = useMemo((): [number, number] => {
    if (center) return [center.lat, center.lng]
    if (userPos) return [userPos.lat, userPos.lng]
    return defaultCenter
  }, [center, userPos])

  return (
    <div className="overflow-hidden rounded-2xl border border-forest-700" style={{ height, width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#102018' }}
        scrollWheelZoom
        doubleClickZoom={!onPlaceRequest}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher onBoundsChange={onBoundsChange} />
        <PlaceClickHandler onPlaceRequest={onPlaceRequest} />
        <Recenter center={mapCenter} />

        {userPos ? (
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
            <Popup>Você está aqui</Popup>
          </Marker>
        ) : null}

        {radiusOverlay ? (
          <Circle
            center={[radiusOverlay.lat, radiusOverlay.lng]}
            radius={radiusOverlay.radiusKm * 1000}
            pathOptions={{
              color: '#e07a3d',
              fillColor: '#e07a3d',
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        ) : null}

        {pivots.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={10}
            pathOptions={{
              color: '#0b140f',
              weight: 2,
              fillColor: reputationColor(p.reputacao_cor),
              fillOpacity: 0.95,
            }}
            eventHandlers={{ click: () => onSelect(p) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <strong>{p.nome}</strong>
              <br />
              <span style={{ fontSize: 12 }}>{p.tipo}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
