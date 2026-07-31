import { useEffect, useState, type FormEvent } from 'react'
import { api, fileUrl } from '../services/api'
import type { Profile as ProfileType } from '../services/types'
import { Modal } from '../components/Modal'
import { formatDate } from '../utils/format'

export function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [biografia, setBiografia] = useState('')
  const [interesses, setInteresses] = useState('')
  const [aniversario, setAniversario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const p = await api<ProfileType>('/perfil')
        setProfile(p)
        setBiografia(p.biografia || '')
        setInteresses(p.interesses || '')
        setAniversario(p.data_aniversario || '')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar perfil')
      }
    })()
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const p = await api<ProfileType>('/perfil', {
        method: 'PUT',
        body: JSON.stringify({
          biografia: biografia || null,
          interesses: interesses || null,
          data_aniversario: aniversario || null,
        }),
      })
      setProfile(p)
      setMsg('Perfil atualizado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setBusy(false)
    }
  }

  async function onAvatar(file: File | null) {
    if (!file) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const p = await api<ProfileType>('/perfil/avatar', { method: 'POST', body: fd })
      setProfile(p)
      setMsg('Avatar atualizado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setBusy(false)
    }
  }

  const avatar = fileUrl(profile?.avatar)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-sand-400">Perfil</h1>
        <p className="text-sm text-stone-400">Sua identidade na trilha</p>
      </div>

      <div className="rounded-2xl border border-forest-700 bg-forest-900/70 p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-signal-400 bg-forest-800 flex items-center justify-center text-2xl">
            {avatar ? <img src={avatar} alt="Avatar" className="h-full w-full object-cover" /> : '🥾'}
          </div>
          <div>
            <div className="font-semibold text-lg">{profile?.nome}</div>
            <div className="text-sm text-stone-400">{profile?.email}</div>
            <label className="mt-2 inline-block text-xs text-signal-400 cursor-pointer hover:underline">
              Trocar avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onAvatar(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-3">
          <label className="block text-sm">
            Biografia
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Interesses pessoais
            <input
              className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={interesses}
              onChange={(e) => setInteresses(e.target.value)}
              placeholder="Trilhas, escalada, bike..."
            />
          </label>
          <label className="block text-sm">
            Data de aniversário
            <input
              type="date"
              className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={aniversario}
              onChange={(e) => setAniversario(e.target.value)}
            />
            {profile?.data_aniversario ? (
              <span className="text-xs text-stone-500">Atual: {formatDate(profile.data_aniversario)}</span>
            ) : null}
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-signal-500 px-5 py-2.5 font-semibold text-forest-950 disabled:opacity-50"
          >
            Salvar perfil
          </button>
          {msg ? <p className="text-sm text-green-300">{msg}</p> : null}
        </form>
      </div>

      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
    </div>
  )
}
