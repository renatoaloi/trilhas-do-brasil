import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { trailService, pivotService, type TrailResponse, type PivotResponse } from '../services/auth'
import Modal from '../components/Modal'
const infoIcon = L.divIcon({
  className: '',
  html: `<div style="background:#4a7c3f;width:18px;height:18px;border-radius:50%;border:3px solid #f0a500;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">i</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const alertIcon = L.divIcon({
  className: '',
  html: `<div style="background:#c0392b;width:18px;height:18px;border-radius:50%;border:3px solid #e85d26;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">!</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const photoIcon = L.divIcon({
  className: '',
  html: `<div style="background:#1a3c5e;width:18px;height:18px;border-radius:50%;border:3px solid #4a7c3f;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">📷</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function getPivotIcon(pivotTypeId: string) {
  switch (pivotTypeId) {
    case '1': return infoIcon
    case '2': return photoIcon
    case '3': return alertIcon
    default: return infoIcon
  }
}

function getPivotLabel(pivotTypeId: string) {
  switch (pivotTypeId) {
    case '1': return 'Informação'
    case '2': return 'Foto'
    case '3': return 'Segurança'
    default: return 'Pivô'
  }
}

const brazilCenter: [number, number] = [-14.235, -51.9253]

export default function Pivots() {
  const [trails, setTrails] = useState<TrailResponse[]>([])
  const [pivots, setPivots] = useState<PivotResponse[]>([])
  const [selectedTrail, setSelectedTrail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    trailService.list()
      .then((res) => setTrails(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedTrail) {
      setPivots([])
      return
    }
    pivotService.getByTrail(selectedTrail)
      .then((res) => setPivots(res.data))
      .catch(() => {
        setError('Erro ao carregar pivôs.')
        setShowError(true)
      })
  }, [selectedTrail])

  const allPivots = pivots.length > 0 ? pivots : []

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6 border-b border-stone/20">
        <h1 className="text-2xl font-display font-bold text-white">Pivôs</h1>
        <p className="text-stone text-sm mt-1">Visualize pontos de interesse registrados nas trilhas.</p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone mb-1">Selecione uma trilha</label>
          <select
            value={selectedTrail}
            onChange={(e) => setSelectedTrail(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-dark-graphite border border-stone/30 rounded-lg text-white focus:outline-none focus:border-safety-orange transition-colors text-sm"
          >
            <option value="">Todas as trilhas</option>
            {trails.map((trail) => (
              <option key={trail.id} value={trail.id}>{trail.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-safety-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
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
            {allPivots.map((pivot) => (
              <Marker
                key={pivot.id}
                position={[pivot.latitude, pivot.longitude]}
                icon={getPivotIcon(pivot.pivot_type_id)}
              >
                <Popup>
                  <div className="text-dark-graphite">
                    <strong>{getPivotLabel(pivot.pivot_type_id)}</strong>
                    <p className="text-sm">{pivot.descricao}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {pivot.latitude.toFixed(5)}, {pivot.longitude.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <Modal open={showError} title="Erro" onClose={() => setShowError(false)}>
        <p className="text-stone">{error}</p>
      </Modal>
    </div>
  )
}
