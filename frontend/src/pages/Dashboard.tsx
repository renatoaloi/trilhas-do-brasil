import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../hooks/useAuth'
import { trailService, type TrailResponse } from '../services/auth'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

const trailIcon = L.divIcon({
  className: '',
  html: `<div style="background:#e85d26;width:20px;height:20px;border-radius:50%;border:3px solid #f0a500;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="background:#1a3c5e;width:16px;height:16px;border-radius:50%;border:3px solid #4a7c3f;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const brazilCenter: [number, number] = [-14.235, -51.9253]

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const map = useMap()

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setPosition(coord)
          map.flyTo(coord, map.getZoom())
        },
        () => {}
      )
    }
  }, [map])

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>Você está aqui</Popup>
    </Marker>
  ) : null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [trails, setTrails] = useState<TrailResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trailService.list()
      .then((res) => setTrails(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6 bg-dark-forest/50 border-b border-stone/20">
        <h1 className="text-2xl font-display font-bold text-white">
          Bem-vindo, {user?.nome || 'Trilheiro'}!
        </h1>
        <p className="text-stone mt-1">Explore trilhas, registre pontos de interesse e compartilhe aventuras.</p>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={brazilCenter}
          zoom={4}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          {!loading && trails.map((trail) => (
            <Marker
              key={trail.id}
              position={[trail.latitude, trail.longitude]}
              icon={trailIcon}
            >
              <Popup>
                <div className="text-dark-graphite">
                  <strong>{trail.nome}</strong>
                  {trail.dificuldade && <p className="text-sm">Dificuldade: {trail.dificuldade}</p>}
                  {trail.distancia_km && <p className="text-sm">{trail.distancia_km.toLocaleString('pt-BR')} km</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
