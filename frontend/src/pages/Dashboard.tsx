import { useCallback, useEffect, useState } from 'react'
import { MapView } from '../components/MapView'
import { PivotDetail } from '../components/PivotDetail'
import { Modal } from '../components/Modal'
import { api } from '../services/api'
import type { Pivot } from '../services/types'
import { TIPOS_PINO } from '../services/types'
import { formatNumber } from '../utils/format'

export function Dashboard() {
  const [pivots, setPivots] = useState<Pivot[]>([])
  const [selected, setSelected] = useState<Pivot | null>(null)
  const [tipo, setTipo] = useState('')
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [offlineOpen, setOfflineOpen] = useState(false)
  const [centerLat, setCenterLat] = useState('')
  const [centerLng, setCenterLng] = useState('')
  const [raio, setRaio] = useState('10')
  const [offlineResult, setOfflineResult] = useState<Pivot[] | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    async (bounds?: {
      min_lat: number
      max_lat: number
      min_lng: number
      max_lng: number
    }) => {
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (tipo) params.set('tipo', tipo)
        if (bounds) {
          params.set('min_lat', String(bounds.min_lat))
          params.set('max_lat', String(bounds.max_lat))
          params.set('min_lng', String(bounds.min_lng))
          params.set('max_lng', String(bounds.max_lng))
        }
        const qs = params.toString()
        const data = await api<Pivot[]>(`/pivots${qs ? `?${qs}` : ''}`)
        setPivots(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar pinos')
      }
    },
    [q, tipo],
  )

  useEffect(() => {
    void load()
  }, [load])

  async function downloadOffline() {
    setBusy(true)
    setError(null)
    try {
      const data = await api<Pivot[]>('/pivots/offline', {
        method: 'POST',
        body: JSON.stringify({
          latitude: Number(centerLat),
          longitude: Number(centerLng),
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

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col">
      <div className="p-3 sm:p-4 border-b border-forest-700 bg-forest-900/70 backdrop-blur space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div>
            <h1 className="text-xl font-bold text-sand-400">Mapa</h1>
            <p className="text-xs text-stone-400">Sua posição e pinos na área visível</p>
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
              onClick={() => setOfflineOpen(true)}
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
          onSelect={setSelected}
          onBoundsChange={(b) => void load(b)}
          height="100%"
        />
      </div>

      <PivotDetail
        pivot={selected}
        onClose={() => setSelected(null)}
        onUpdated={(p) => {
          setSelected(p)
          setPivots((prev) => prev.map((x) => (x.id === p.id ? p : x)))
        }}
      />

      <Modal open={offlineOpen} title="Baixar pinos offline" onClose={() => setOfflineOpen(false)}>
        <div className="space-y-3">
          <p className="text-sm text-stone-400">
            Escolha um pino central (lat/lng) e o raio em km para salvar na memória do aparelho.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm col-span-1">
              Latitude
              <input
                className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
                value={centerLat}
                onChange={(e) => setCenterLat(e.target.value)}
              />
            </label>
            <label className="text-sm col-span-1">
              Longitude
              <input
                className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
                value={centerLng}
                onChange={(e) => setCenterLng(e.target.value)}
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
          <button
            type="button"
            disabled={busy}
            onClick={() => void downloadOffline()}
            className="w-full rounded-xl bg-signal-500 py-2.5 font-semibold text-forest-950 disabled:opacity-50"
          >
            {busy ? 'Baixando...' : 'Baixar'}
          </button>
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

      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
    </div>
  )
}
