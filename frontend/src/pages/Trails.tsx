import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { trailService, type TrailResponse } from '../services/auth'
import Modal from '../components/Modal'

const dificuldadeColor: Record<string, string> = {
  'fácil': 'bg-moss text-white',
  'médio': 'bg-safety-yellow text-dark-graphite',
  'difícil': 'bg-safety-orange text-white',
  'muito difícil': 'bg-danger-red text-white',
}

export default function Trails() {
  const [trails, setTrails] = useState<TrailResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [trailToDelete, setTrailToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadTrails()
  }, [])

  const loadTrails = () => {
    setLoading(true)
    trailService.list()
      .then((res) => setTrails(res.data))
      .catch(() => {
        setError('Erro ao carregar trilhas.')
        setShowError(true)
      })
      .finally(() => setLoading(false))
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadTrails()
      return
    }
    setLoading(true)
    try {
      const res = await trailService.search(search)
      setTrails(res.data)
    } catch {
      setError('Erro ao buscar trilhas.')
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (id: string) => {
    setTrailToDelete(id)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!trailToDelete) return
    setDeleting(trailToDelete)
    try {
      await trailService.delete(trailToDelete)
      setTrails((prev) => prev.filter((t) => t.id !== trailToDelete))
    } catch {
      setError('Erro ao excluir trilha.')
      setShowError(true)
    } finally {
      setDeleting(null)
      setTrailToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Trilhas</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nome ou região..."
            className="flex-1 px-3 py-2 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors text-sm"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-moss hover:bg-moss/80 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-safety-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trails.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone">Nenhuma trilha encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trails.map((trail) => (
            <div
              key={trail.id}
              className="bg-dark-graphite border border-stone/20 rounded-xl overflow-hidden hover:border-stone/40 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-display font-bold text-white">{trail.nome}</h2>
                  {trail.dificuldade && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dificuldadeColor[trail.dificuldade.toLowerCase()] || 'bg-stone/20 text-stone'}`}>
                      {trail.dificuldade}
                    </span>
                  )}
                </div>

                {trail.nome_social && (
                  <p className="text-sm text-stone mb-2">Conhecida como: {trail.nome_social}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone mb-3">
                  {trail.distancia_km && (
                    <span>{trail.distancia_km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km</span>
                  )}
                  {trail.elevacao_m && (
                    <span>{trail.elevacao_m.toLocaleString('pt-BR')} m</span>
                  )}
                  {trail.duracao_estimada && (
                    <span>{trail.duracao_estimada}</span>
                  )}
                </div>

                {trail.descricao && (
                  <p className="text-sm text-stone/70 line-clamp-2 mb-3">{trail.descricao}</p>
                )}

                <div className="flex items-center justify-between text-xs text-stone/50">
                  <span>Criada em {formatDate(trail.created_at)}</span>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-stone/10">
                  <Link
                    to={`/trails/${trail.id}`}
                    className="flex-1 text-center px-3 py-1.5 bg-moss/20 hover:bg-moss/40 text-moss font-medium rounded-lg text-sm transition-colors"
                  >
                    Detalhes
                  </Link>
                  <button
                    onClick={() => confirmDelete(trail.id)}
                    disabled={deleting === trail.id}
                    className="px-3 py-1.5 bg-danger-red/10 hover:bg-danger-red/20 text-danger-red font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {deleting === trail.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showError} title="Erro" onClose={() => setShowError(false)}>
        <p className="text-stone">{error}</p>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        title="Confirmar Exclusão"
        onClose={() => { setShowDeleteConfirm(false); setTrailToDelete(null) }}
        actions={
          <>
            <button
              onClick={() => { setShowDeleteConfirm(false); setTrailToDelete(null) }}
              className="px-4 py-2 bg-stone/20 hover:bg-stone/40 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-danger-red hover:bg-danger-red/80 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Confirmar Exclusão
            </button>
          </>
        }
      >
        <p className="text-stone">Tem certeza que deseja excluir esta trilha? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}
