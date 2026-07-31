import { useEffect, useState, type FormEvent } from 'react'
import { api, fileUrl } from '../services/api'
import type { Pivot } from '../services/types'
import { TIPOS_PINO } from '../services/types'
import { Modal } from '../components/Modal'
import { PivotDetail } from '../components/PivotDetail'
import { formatDateTime, reputationColor, renderMarkdownLite } from '../utils/format'
import { useAuth } from '../hooks/useAuth'

const emptyForm = {
  nome: '',
  descricao: '',
  latitude: '',
  longitude: '',
  tipo: 'a_pe',
  regiao: '',
}

export function Pivots() {
  const { user } = useAuth()
  const [items, setItems] = useState<Pivot[]>([])
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [foto, setFoto] = useState<File | null>(null)
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

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const created = await api<Pivot>('/pivots', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao || null,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          tipo: form.tipo,
          regiao: form.regiao || null,
        }),
      })
      if (foto) {
        const fd = new FormData()
        fd.append('file', foto)
        const withFoto = await api<Pivot>(`/pivots/${created.id}/foto`, {
          method: 'POST',
          body: fd,
        })
        setItems((prev) => [withFoto, ...prev])
      } else {
        setItems((prev) => [created, ...prev])
      }
      setForm(emptyForm)
      setFoto(null)
      setFormOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pino')
    } finally {
      setBusy(false)
    }
  }

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

  function insertMd(snippet: string) {
    setForm((f) => ({ ...f, descricao: `${f.descricao}${snippet}` }))
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

      <Modal open={formOpen} title="Novo pivot" onClose={() => setFormOpen(false)}>
        <form onSubmit={onCreate} className="space-y-3">
          <input
            required
            placeholder="Nome"
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <div className="flex flex-wrap gap-1 text-xs">
            <button type="button" className="px-2 py-1 rounded bg-forest-800" onClick={() => insertMd('**negrito**')}>
              Negrito
            </button>
            <button type="button" className="px-2 py-1 rounded bg-forest-800" onClick={() => insertMd('\n## Título\n')}>
              Título
            </button>
            <button type="button" className="px-2 py-1 rounded bg-forest-800" onClick={() => insertMd('\n- item\n')}>
              Lista
            </button>
          </div>
          <textarea
            rows={4}
            placeholder="Descrição (markdown)"
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2 font-mono text-sm"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="number"
              step="any"
              placeholder="Latitude"
              className="rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
            <input
              required
              type="number"
              step="any"
              placeholder="Longitude"
              className="rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>
          <select
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            {TIPOS_PINO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Região"
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.regiao}
            onChange={(e) => setForm({ ...form, regiao: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-signal-500 py-2.5 font-semibold text-forest-950 disabled:opacity-50"
          >
            Salvar
          </button>
        </form>
      </Modal>

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
