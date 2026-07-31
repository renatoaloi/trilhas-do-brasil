import { useEffect, useState, type FormEvent } from 'react'
import { api, fileUrl } from '../services/api'
import type { AttentionPoint, Comment, Pivot } from '../services/types'
import { TIPOS_ATENCAO } from '../services/types'
import { formatDateTime, renderMarkdownLite, reputationColor, formatNumber } from '../utils/format'
import { Modal } from './Modal'

type Props = {
  pivot: Pivot | null
  onClose: () => void
  onUpdated: (p: Pivot) => void
}

export function PivotDetail({ pivot, onClose, onUpdated }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [attention, setAttention] = useState<AttentionPoint[]>([])
  const [texto, setTexto] = useState('')
  const [attNome, setAttNome] = useState('')
  const [attTipo, setAttTipo] = useState('perigo')
  const [attDesc, setAttDesc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!pivot) return
    ;(async () => {
      try {
        const [c, a] = await Promise.all([
          api<Comment[]>(`/pivots/${pivot.id}/comentarios`),
          api<AttentionPoint[]>(`/pivots/${pivot.id}/atencao`),
        ])
        setComments(c)
        setAttention(a)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar detalhes')
      }
    })()
  }, [pivot])

  if (!pivot) return null

  async function vote(tipo: 'positivo' | 'negativo') {
    setBusy(true)
    try {
      const updated = await api<Pivot>(`/pivots/${pivot!.id}/votos`, {
        method: 'POST',
        body: JSON.stringify({ tipo }),
      })
      onUpdated(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao votar')
    } finally {
      setBusy(false)
    }
  }

  async function addComment(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const c = await api<Comment>(`/pivots/${pivot!.id}/comentarios`, {
        method: 'POST',
        body: JSON.stringify({ texto }),
      })
      setComments((prev) => [c, ...prev])
      setTexto('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao comentar')
    } finally {
      setBusy(false)
    }
  }

  async function addAttention(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const a = await api<AttentionPoint>(`/pivots/${pivot!.id}/atencao`, {
        method: 'POST',
        body: JSON.stringify({ nome: attNome, tipo: attTipo, descricao: attDesc || null }),
      })
      setAttention((prev) => [a, ...prev])
      setAttNome('')
      setAttDesc('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar alerta')
    } finally {
      setBusy(false)
    }
  }

  const foto = fileUrl(pivot.foto)

  return (
    <>
      <Modal open={!!pivot} title={pivot.nome} onClose={onClose}>
        <div className="space-y-4">
          {foto ? (
            <img src={foto} alt={pivot.nome} className="w-full max-h-48 object-cover rounded-xl" />
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1"
              style={{ background: `${reputationColor(pivot.reputacao_cor)}33` }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: reputationColor(pivot.reputacao_cor) }}
              />
              Reputação {formatNumber(pivot.reputacao_score)}
            </span>
            <span className="text-stone-400">{pivot.tipo}</span>
            {pivot.regiao ? <span className="text-stone-400">· {pivot.regiao}</span> : null}
          </div>
          {pivot.descricao ? (
            <div
              className="text-sm text-stone-200 prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdownLite(pivot.descricao) }}
            />
          ) : (
            <p className="text-sm text-stone-500">Sem descrição</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => vote('positivo')}
              className="flex-1 rounded-lg bg-green-700/40 py-2 text-sm hover:bg-green-700/60"
            >
              👍 {pivot.votos_positivos}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => vote('negativo')}
              className="flex-1 rounded-lg bg-red-800/40 py-2 text-sm hover:bg-red-800/60"
            >
              👎 {pivot.votos_negativos}
            </button>
          </div>

          <section>
            <h3 className="font-semibold text-sand-400 mb-2">Pontos de atenção</h3>
            <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {attention.map((a) => (
                <li key={a.id} className="rounded-lg bg-danger-500/10 border border-danger-500/30 px-3 py-2 text-sm">
                  <div className="font-medium text-red-200">{a.nome}</div>
                  <div className="text-xs text-stone-400">{a.tipo}</div>
                  {a.descricao ? <p className="text-xs mt-1">{a.descricao}</p> : null}
                </li>
              ))}
              {attention.length === 0 ? (
                <li className="text-xs text-stone-500">Nenhum alerta registrado</li>
              ) : null}
            </ul>
            <form onSubmit={addAttention} className="space-y-2">
              <input
                required
                placeholder="Nome do alerta"
                className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2 text-sm"
                value={attNome}
                onChange={(e) => setAttNome(e.target.value)}
              />
              <select
                className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2 text-sm"
                value={attTipo}
                onChange={(e) => setAttTipo(e.target.value)}
              >
                {TIPOS_ATENCAO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Descrição (opcional)"
                className="w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2 text-sm"
                value={attDesc}
                onChange={(e) => setAttDesc(e.target.value)}
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg border border-danger-500/50 py-2 text-sm text-red-200"
              >
                Registrar alerta
              </button>
            </form>
          </section>

          <section>
            <h3 className="font-semibold text-sand-400 mb-2">Comentários</h3>
            <form onSubmit={addComment} className="flex gap-2 mb-3">
              <input
                required
                placeholder="Deixe um comentário"
                className="flex-1 rounded-lg bg-forest-950 border border-forest-600 px-3 py-2 text-sm"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-signal-500 px-3 py-2 text-sm font-semibold text-forest-950"
              >
                Enviar
              </button>
            </form>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg bg-forest-950/70 px-3 py-2 text-sm">
                  <div className="text-xs text-stone-500">
                    {c.autor_nome || 'Usuário'} · {formatDateTime(c.created_at)}
                  </div>
                  <p className="mt-1">{c.texto}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Modal>
      <Modal open={!!error} title="Aviso" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
    </>
  )
}
