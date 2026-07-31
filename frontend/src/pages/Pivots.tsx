import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, fileUrl } from '../services/api'
import type { Pivot } from '../services/types'
import { Modal } from '../components/Modal'
import { CreatePivotModal } from '../components/CreatePivotModal'
import { PivotDetail } from '../components/PivotDetail'
import { formatDateTime, reputationColor, renderMarkdownLite } from '../utils/format'
import { useAuth } from '../hooks/useAuth'

export function Pivots() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<Pivot[]>([])
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Pivot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Pivot | null>(null)

  async function load() {
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : ''
      setItems(await api<Pivot[]>(`/pivots${params}`))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao listar')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onDelete() {
    if (!confirmDelete) return
    setBusy(true)
    try {
      await api(`/pivots/${confirmDelete.id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((p) => p.id !== confirmDelete.id))
      setConfirmDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sand-400">Pivots</h1>
          <p className="text-sm text-stone-400">Pinos de interesse na comunidade</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="rounded-xl bg-signal-500 px-4 py-2.5 font-semibold text-forest-950"
        >
          Novo pino
        </button>
      </div>

      <div className="flex gap-2">
        <input
          placeholder="Buscar por nome ou região"
          className="flex-1 rounded-xl bg-forest-900 border border-forest-600 px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl bg-forest-700 px-4 py-2"
        >
          Buscar
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-forest-700 bg-forest-900/70 p-4 flex flex-col sm:flex-row gap-4"
          >
            {p.foto ? (
              <img
                src={fileUrl(p.foto)}
                alt={p.nome}
                className="w-full sm:w-28 h-28 object-cover rounded-xl"
              />
            ) : (
              <div
                className="w-full sm:w-28 h-28 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${reputationColor(p.reputacao_cor)}33` }}
              >
                📍
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-lg">{p.nome}</h2>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: reputationColor(p.reputacao_cor) }}
                />
                <span className="text-xs text-stone-400">{p.tipo}</span>
              </div>
              {p.descricao ? (
                <div
                  className="text-sm text-stone-300 mt-1 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownLite(p.descricao) }}
                />
              ) : null}
              <div className="text-xs text-stone-500 mt-2">
                {p.regiao || 'Sem região'} · {formatDateTime(p.created_at)} · 👍 {p.votos_positivos}{' '}
                · 👎 {p.votos_negativos}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-forest-600 px-3 py-1.5 text-sm"
                  onClick={() => setSelected(p)}
                >
                  Detalhes
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-signal-500/40 text-signal-300 px-3 py-1.5 text-sm"
                  onClick={() => navigate('/dashboard', { state: { center: { lat: p.latitude, lng: p.longitude } } })}
                >
                  Ver no Mapa
                </button>
                {user?.id === p.user_id ? (
                  <button
                    type="button"
                    className="rounded-lg border border-danger-500/40 text-red-300 px-3 py-1.5 text-sm"
                    onClick={() => setConfirmDelete(p)}
                  >
                    Excluir
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="text-stone-500 text-sm">Nenhum pino encontrado.</p>
        ) : null}
      </div>

      <CreatePivotModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={(p) => setItems((prev) => [p, ...prev])}
      />

      <Modal
        open={!!confirmDelete}
        title="Excluir pino?"
        onClose={() => setConfirmDelete(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-forest-600 px-4 py-2"
              onClick={() => setConfirmDelete(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg bg-danger-500 px-4 py-2 text-white"
              onClick={() => void onDelete()}
            >
              Excluir
            </button>
          </div>
        }
      >
        <p>Remover “{confirmDelete?.nome}”? Esta ação não pode ser desfeita.</p>
      </Modal>

      <PivotDetail
        pivot={selected}
        onClose={() => setSelected(null)}
        onUpdated={(p) => {
          setSelected(p)
          setItems((prev) => prev.map((x) => (x.id === p.id ? p : x)))
        }}
      />

      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
    </div>
  )
}
