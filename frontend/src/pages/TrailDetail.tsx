import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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
    case '3': return 'Segurança / Rota'
    default: return 'Pivô'
  }
}

export default function TrailDetail() {
  const { id } = useParams<{ id: string }>()
  const [trail, setTrail] = useState<TrailResponse | null>(null)
  const [pivots, setPivots] = useState<PivotResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      trailService.getById(id),
      pivotService.getByTrail(id),
    ])
      .then(([trailRes, pivotRes]) => {
        setTrail(trailRes.data)
        setPivots(pivotRes.data)
      })
      .catch(() => {
        setError('Erro ao carregar detalhes da trilha.')
        setShowError(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-safety-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!trail) {
    return (
      <div className="text-center py-16">
        <p className="text-stone">Trilha não encontrada.</p>
        <Link to="/trails" className="text-safety-yellow hover:underline mt-2 inline-block">Voltar para trilhas</Link>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6 border-b border-stone/20">
        <Link to="/trails" className="text-safety-yellow hover:underline text-sm">&larr; Voltar para trilhas</Link>
        <h1 className="text-2xl font-display font-bold text-white mt-2">{trail.nome}</h1>
        {trail.nome_social && <p className="text-stone text-sm">Conhecida como: {trail.nome_social}</p>}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="p-4 md:p-6 overflow-auto">
          <div className="space-y-4">
            {trail.descricao && (
              <div>
                <h2 className="text-lg font-display font-bold text-white mb-2">Descrição</h2>
                <p className="text-stone whitespace-pre-wrap">{trail.descricao}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-display font-bold text-white mb-2">Informações da Trilha</h2>
              <div className="grid grid-cols-2 gap-3">
                {trail.dificuldade && (
                  <div className="bg-dark-graphite border border-stone/20 rounded-lg p-3">
                    <span className="text-xs text-stone">Dificuldade</span>
                    <p className="text-white font-medium">{trail.dificuldade}</p>
                  </div>
                )}
                {trail.distancia_km && (
                  <div className="bg-dark-graphite border border-stone/20 rounded-lg p-3">
                    <span className="text-xs text-stone">Distância</span>
                    <p className="text-white font-medium">{trail.distancia_km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km</p>
                  </div>
                )}
                {trail.elevacao_m && (
                  <div className="bg-dark-graphite border border-stone/20 rounded-lg p-3">
                    <span className="text-xs text-stone">Elevação</span>
                    <p className="text-white font-medium">{trail.elevacao_m.toLocaleString('pt-BR')} m</p>
                  </div>
                )}
                {trail.duracao_estimada && (
                  <div className="bg-dark-graphite border border-stone/20 rounded-lg p-3">
                    <span className="text-xs text-stone">Duração</span>
                    <p className="text-white font-medium">{trail.duracao_estimada}</p>
                  </div>
                )}
                {trail.condicoes && (
                  <div className="bg-dark-graphite border border-stone/20 rounded-lg p-3 col-span-2">
                    <span className="text-xs text-stone">Condições</span>
                    <p className="text-white font-medium">{trail.condicoes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-display font-bold text-white mb-2">Criada em</h2>
              <p className="text-stone">{formatDate(trail.created_at)}</p>
            </div>

            {pivots.length > 0 && (
              <div>
                <h2 className="text-lg font-display font-bold text-white mb-2">Pontos de Interesse ({pivots.length})</h2>
                <div className="space-y-2">
                  {pivots.map((pivot) => (
                    <div key={pivot.id} className="bg-dark-graphite border border-stone/20 rounded-lg p-3 flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5">
                        {pivot.pivot_type_id === '1' ? 'ℹ️' : pivot.pivot_type_id === '2' ? '📷' : '⚠️'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{getPivotLabel(pivot.pivot_type_id)}</p>
                        <p className="text-sm text-stone">{pivot.descricao}</p>
                        <p className="text-xs text-stone/50 mt-1">
                          {pivot.latitude.toFixed(5)}, {pivot.longitude.toFixed(5)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-96 lg:h-full relative">
          <MapContainer
            center={[trail.latitude, trail.longitude]}
            zoom={13}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[trail.latitude, trail.longitude]}>
              <Popup>
                <div className="text-dark-graphite">
                  <strong>{trail.nome}</strong>
                </div>
              </Popup>
            </Marker>
            {pivots.map((pivot) => (
              <Marker
                key={pivot.id}
                position={[pivot.latitude, pivot.longitude]}
                icon={getPivotIcon(pivot.pivot_type_id)}
              >
                <Popup>
                  <div className="text-dark-graphite">
                    <strong>{getPivotLabel(pivot.pivot_type_id)}</strong>
                    <p className="text-sm">{pivot.descricao}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <Modal open={showError} title="Erro" onClose={() => setShowError(false)}>
        <p className="text-stone">{error}</p>
      </Modal>
    </div>
  )
}
