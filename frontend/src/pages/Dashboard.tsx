import { useCallback, useRef, useState } from 'react'
import { MapView, type RadiusOverlay } from '../components/MapView'
import { CreatePivotModal, type PlaceCoords } from '../components/CreatePivotModal'
import { PivotDetail } from '../components/PivotDetail'
import { Modal } from '../components/Modal'
import { api } from '../services/api'
import type { Pivot } from '../services/types'
import { TIPOS_PINO } from '../services/types'
import { formatNumber } from '../utils/format'

type Bounds = {
  min_lat: number
  max_lat: number
  min_lng: number
  max_lng: number
}

export function Dashboard() {
  const [pivots, setPivots] = useState<Pivot[]>([])
  const [selected, setSelected] = useState<Pivot | null>(null)
  const [tipo, setTipo] = useState('')
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [offlineSelecting, setOfflineSelecting] = useState(false)
  const [offlineCenter, setOfflineCenter] = useState<Pivot | null>(null)
  const [offlineOpen, setOfflineOpen] = useState(false)
  const [offlineMinimized, setOfflineMinimized] = useState(false)
  const [offlineLat, setOfflineLat] = useState('')
  const [offlineLng, setOfflineLng] = useState('')
  const [raio, setRaio] = useState('10')
  const [offlineResult, setOfflineResult] = useState<Pivot[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [placeCoords, setPlaceCoords] = useState<PlaceCoords | null>(null)
  const boundsRef = useRef<Bounds | undefined>(undefined)
  const filtersRef = useRef({ q: '', tipo: '' })
  filtersRef.current = { q, tipo }

  const load = useCallback(async (bounds?: Bounds) => {
    if (bounds) boundsRef.current = bounds
    const activeBounds = bounds ?? boundsRef.current
    const { q: qf, tipo: tf } = filtersRef.current
    try {
      const params = new URLSearchParams()
      if (qf) params.set('q', qf)
      if (tf) params.set('tipo', tf)
      if (activeBounds) {
        params.set('min_lat', String(activeBounds.min_lat))
        params.set('max_lat', String(activeBounds.max_lat))
        params.set('min_lng', String(activeBounds.min_lng))
        params.set('max_lng', String(activeBounds.max_lng))
      }
      const qs = params.toString()
      const data = await api<Pivot[]>(`/pivots${qs ? `?${qs}` : ''}`)
      setPivots(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar pinos')
    }
  }, [])

  function exitOffline() {
    setOfflineSelecting(false)
    setOfflineCenter(null)
    setOfflineOpen(false)
    setOfflineMinimized(false)
    setOfflineLat('')
    setOfflineLng('')
    setRaio('10')
    setOfflineResult(null)
  }

  function minimizeOffline() {
    setOfflineOpen(false)
    setOfflineSelecting(false)
    setOfflineMinimized(true)
  }

  function expandOffline() {
    setOfflineMinimized(false)
    setOfflineOpen(true)
  }

  function enterOffline() {
    setOfflineSelecting(true)
    setOfflineCenter(null)
    setOfflineOpen(false)
    setOfflineLat('')
    setOfflineLng('')
    setRaio('10')
    setOfflineResult(null)
  }

  function handleSelect(pivot: Pivot) {
    if (offlineSelecting) {
      setOfflineCenter(pivot)
      setOfflineLat(String(pivot.latitude))
      setOfflineLng(String(pivot.longitude))
      setRaio('10')
      setOfflineResult(null)
      setOfflineOpen(true)
      return
    }
    setSelected(pivot)
  }

  function handlePlaceRequest(coords: PlaceCoords) {
    if (offlineSelecting) return
    setPlaceCoords(coords)
    setCreateOpen(true)
  }

  async function downloadOffline() {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Pivot[]>('/pivots/offline', {
        method: 'POST',
        body: JSON.stringify({
          latitude: Number(offlineLat),
          longitude: Number(offlineLng),
          raio_km: Number(raio),
        }),
      })
      localStorage.setItem(
        'offline_pivots',
        JSON.stringify({ savedAt: new Date().toISOString(), items: data }),
      )
      setOfflineResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no download offline')
    } finally {
      setBusy(false)
    }
  }

  const radiusOverlay: RadiusOverlay | null = (offlineCenter || offlineOpen || offlineMinimized) && offlineLat && offlineLng
    ? { lat: Number(offlineLat), lng: Number(offlineLng), radiusKm: Number(raio) || 0 }
    : null

  const subtitle = offlineSelecting
    ? 'Clique em um pino no mapa para definir o centro · Duplo clique no mapa para criar um pino'
    : 'Sua posição e pinos na área visível · Duplo clique no mapa para criar um pino'

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col">
      <div className="p-3 sm:p-4 border-b border-forest-700 bg-forest-900/70 backdrop-blur space-y-3">
        {offlineSelecting ? (
          <div className="flex items-center justify-between rounded-xl bg-signal-500/20 border border-signal-500/40 px-3 py-2 text-sm">
            <span className="text-signal-400 font-medium">
              Clique em um pino no mapa para definir o centro do download offline
            </span>
            <button
              type="button"
              onClick={exitOffline}
              className="rounded-lg border border-signal-500/40 px-3 py-1 text-xs text-signal-300 hover:bg-signal-500/20"
            >
              Cancelar
            </button>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div>
            <h1 className="text-xl font-bold text-sand-400">Mapa</h1>
            <p className="text-xs text-stone-400">{subtitle}</p>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input
              placeholder="Buscar trilha ou região"
              className="flex-1 rounded-xl bg-forest-950 border border-forest-600 px-3 py-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="rounded-xl bg-forest-950 border border-forest-600 px-3 py-2 text-sm"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              {TIPOS_PINO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-xl bg-forest-700 px-4 py-2 text-sm font-medium"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={enterOffline}
              className="rounded-xl bg-signal-500/90 px-4 py-2 text-sm font-semibold text-forest-950"
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 sm:p-4">
        <MapView
          pivots={pivots}
          onSelect={handleSelect}
          onBoundsChange={(b) => void load(b)}
          onPlaceRequest={offlineSelecting ? undefined : handlePlaceRequest}
          radiusOverlay={radiusOverlay}
          height="100%"
        />
      </div>

      <CreatePivotModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          setPlaceCoords(null)
        }}
        initialCoords={placeCoords}
        onCreated={() => {
          void load()
        }}
      />

      {selected ? (
        <PivotDetail
          pivot={selected}
          onClose={() => setSelected(null)}
          onUpdated={(p) => {
            setSelected(p)
            setPivots((prev) => prev.map((x) => (x.id === p.id ? p : x)))
          }}
        />
      ) : null}

      <Modal
        open={offlineOpen}
        title="Baixar pinos offline"
        onClose={exitOffline}
      >
        <div className="space-y-3">
          <p className="text-sm text-stone-400">
            {offlineCenter
              ? `Centro: ${offlineCenter.nome} · Ajuste coordenadas e raio`
              : 'Escolha um pino central (lat/lng) e o raio em km para salvar na memória do aparelho.'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm col-span-1">
              Latitude
              <input
                className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
                value={offlineLat}
                onChange={(e) => setOfflineLat(e.target.value)}
              />
            </label>
            <label className="text-sm col-span-1">
              Longitude
              <input
                className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
                value={offlineLng}
                onChange={(e) => setOfflineLng(e.target.value)}
              />
            </label>
          </div>
          <label className="block text-sm">
            Raio (km)
            <input
              type="number"
              min={0.1}
              max={200}
              step={0.1}
              className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={raio}
              onChange={(e) => setRaio(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void downloadOffline()}
              className="flex-1 rounded-xl bg-signal-500 py-2.5 font-semibold text-forest-950 disabled:opacity-50"
            >
              {busy ? 'Baixando...' : 'Baixar'}
            </button>
            <button
              type="button"
              onClick={minimizeOffline}
              className="rounded-xl border border-forest-600 px-3 py-2.5 text-sm text-stone-300 hover:bg-forest-800"
            >
              Minimizar
            </button>
          </div>
          {offlineResult ? (
            <div className="rounded-xl border border-forest-600 p-3 text-sm">
              <p className="text-green-300 mb-2">
                {formatNumber(offlineResult.length)} pinos salvos em localStorage
              </p>
              <ul className="max-h-40 overflow-y-auto space-y-1">
                {offlineResult.map((p) => (
                  <li key={p.id}>
                    {p.nome}{' '}
                    <span className="text-stone-500">
                      ({formatNumber(p.distancia_km ?? 0)} km)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Modal>

      {offlineMinimized ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-xl border border-signal-500/40 bg-forest-900/95 px-4 py-2.5 shadow-lg backdrop-blur">
          <span className="text-sm text-signal-400 font-medium">
            {offlineCenter?.nome || 'Centro offline'} · {raio} km
          </span>
          <button
            type="button"
            onClick={expandOffline}
            className="rounded-lg bg-signal-500 px-3 py-1 text-xs font-semibold text-forest-950"
          >
            Expandir
          </button>
          <button
            type="button"
            onClick={exitOffline}
            className="rounded-lg border border-signal-500/40 px-2 py-1 text-xs text-signal-300 hover:bg-signal-500/20"
          >
            ✕
          </button>
        </div>
      ) : null}

      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
    </div>
  )
}
