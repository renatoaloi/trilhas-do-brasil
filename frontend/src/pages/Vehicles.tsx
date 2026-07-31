import { useEffect, useState, type FormEvent } from 'react'
import { api, fileUrl } from '../services/api'
import type { Vehicle } from '../services/types'
import { TIPOS_VEICULO } from '../services/types'
import { Modal } from '../components/Modal'

const empty = { marca: '', modelo: '', descricao: '', tipo: 'outros' }

export function Vehicles() {
  const [items, setItems] = useState<Vehicle[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState<Vehicle | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)

  async function load() {
    try {
      setItems(await api<Vehicle[]>('/veiculos'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar veículos')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function startCreate() {
    setEditId(null)
    setForm(empty)
    setFotoFile(null)
    setOpen(true)
  }

  function startEdit(v: Vehicle) {
    setEditId(v.id)
    setForm({
      marca: v.marca,
      modelo: v.modelo,
      descricao: v.descricao || '',
      tipo: v.tipo,
    })
    setFotoFile(null)
    setOpen(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const body = {
        marca: form.marca,
        modelo: form.modelo,
        descricao: form.descricao || null,
        tipo: form.tipo,
      }
      let saved: Vehicle
      if (editId) {
        saved = await api<Vehicle>(`/veiculos/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      } else {
        saved = await api<Vehicle>('/veiculos', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
      if (fotoFile) {
        const fd = new FormData()
        fd.append('file', fotoFile)
        saved = await api<Vehicle>(`/veiculos/${saved.id}/foto`, {
          method: 'POST',
          body: fd,
        })
      }
      if (editId) {
        setItems((prev) => prev.map((x) => (x.id === saved.id ? saved : x)))
      } else {
        setItems((prev) => [saved, ...prev])
      }
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!toDelete) return
    setBusy(true)
    try {
      await api(`/veiculos/${toDelete.id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sand-400">Veículos</h1>
          <p className="text-sm text-stone-400">Seu equipamento de aventura</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-xl bg-signal-500 px-4 py-2.5 font-semibold text-forest-950"
        >
          Adicionar
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((v) => (
          <article
            key={v.id}
            className="rounded-2xl border border-forest-700 bg-forest-900/70 p-4 flex flex-col sm:flex-row gap-4"
          >
            {v.foto ? (
              <img
                src={fileUrl(v.foto)}
                alt={`${v.marca} ${v.modelo}`}
                className="w-full sm:w-28 h-28 object-cover rounded-xl"
              />
            ) : null}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">
                  {v.marca} {v.modelo}
                </h2>
                <span className="text-xs text-stone-400 capitalize">{v.tipo}</span>
              </div>
              {v.descricao ? <p className="text-sm mt-1 text-stone-300">{v.descricao}</p> : null}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-forest-600 px-3 py-1.5 text-sm"
                  onClick={() => startEdit(v)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-danger-500/40 text-red-300 px-3 py-1.5 text-sm"
                  onClick={() => setToDelete(v)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="text-sm text-stone-500">Nenhum veículo cadastrado.</p> : null}
      </div>

      <Modal open={open} title={editId ? 'Editar veículo' : 'Novo veículo'} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            required
            placeholder="Marca"
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.marca}
            onChange={(e) => setForm({ ...form, marca: e.target.value })}
          />
          <input
            required
            placeholder="Modelo"
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.modelo}
            onChange={(e) => setForm({ ...form, modelo: e.target.value })}
          />
          <select
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            {TIPOS_VEICULO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <textarea
            rows={3}
            placeholder="Descrição"
            className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <div className="space-y-2">
            <label className="block text-sm text-stone-400">Foto</label>
            {fotoFile ? (
              <img
                src={URL.createObjectURL(fotoFile)}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl"
              />
            ) : editId && items.find((v) => v.id === editId)?.foto ? (
              <img
                src={fileUrl(items.find((v) => v.id === editId)!.foto)}
                alt="Foto atual"
                className="w-full h-40 object-cover rounded-xl"
              />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="w-full text-sm text-stone-300 file:mr-2 file:rounded-lg file:border-0 file:bg-forest-700 file:px-3 file:py-1.5 file:text-sm file:text-stone-200"
              onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
            />
          </div>
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
        open={!!toDelete}
        title="Excluir veículo?"
        onClose={() => setToDelete(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-lg border border-forest-600 px-4 py-2" onClick={() => setToDelete(null)}>
              Cancelar
            </button>
            <button type="button" disabled={busy} className="rounded-lg bg-danger-500 px-4 py-2" onClick={() => void onDelete()}>
              Excluir
            </button>
          </div>
        }
      >
        <p>
          Remover {toDelete?.marca} {toDelete?.modelo}?
        </p>
      </Modal>

      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
    </div>
  )
}
