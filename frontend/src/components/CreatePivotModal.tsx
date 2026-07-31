import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../services/api'
import type { Pivot } from '../services/types'
import { TIPOS_PINO } from '../services/types'
import { Modal } from './Modal'

export type PlaceCoords = { lat: number; lng: number }

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (pivot: Pivot) => void
  initialCoords?: PlaceCoords | null
}

const emptyForm = {
  nome: '',
  descricao: '',
  latitude: '',
  longitude: '',
  tipo: 'a_pe',
  regiao: '',
}

function coordsToForm(coords?: PlaceCoords | null) {
  if (!coords) return { latitude: '', longitude: '' }
  return {
    latitude: String(coords.lat),
    longitude: String(coords.lng),
  }
}

export function CreatePivotModal({ open, onClose, onCreated, initialCoords }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [foto, setFoto] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      ...emptyForm,
      ...coordsToForm(initialCoords),
    })
    setFoto(null)
    setError(null)
  }, [open, initialCoords])

  function insertMd(snippet: string) {
    setForm((f) => ({ ...f, descricao: `${f.descricao}${snippet}` }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
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
      let result = created
      if (foto) {
        const fd = new FormData()
        fd.append('file', foto)
        result = await api<Pivot>(`/pivots/${created.id}/foto`, {
          method: 'POST',
          body: fd,
        })
      }
      onCreated(result)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pino')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Modal open={open} title="Novo pivot" onClose={onClose}>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            required
            placeholder="Nome"
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <div className="flex flex-wrap gap-1 text-xs">
            <button
              type="button"
              className="px-2 py-1 rounded bg-forest-800"
              onClick={() => insertMd('**negrito**')}
            >
              Negrito
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded bg-forest-800"
              onClick={() => insertMd('\n## Título\n')}
            >
              Título
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded bg-forest-800"
              onClick={() => insertMd('\n- item\n')}
            >
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

      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
    </>
  )
}
