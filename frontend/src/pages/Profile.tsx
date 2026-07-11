import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { profileService } from '../services/auth'
import Modal from '../components/Modal'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [biografia, setBiografia] = useState('')
  const [interesses, setInteresses] = useState('')
  const [dataAniversario, setDataAniversario] = useState('')
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    profileService.getMe()
      .then((res) => {
        setBiografia(res.data.biografia || '')
        setInteresses(res.data.interesses_pessoais || '')
        setDataAniversario(res.data.data_aniversario || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await profileService.updateMe({
        biografia,
        interesses_pessoais: interesses,
        data_aniversario: dataAniversario || undefined,
      })
      setShowSuccess(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Erro ao salvar perfil.')
      } else {
        setError('Erro ao salvar perfil.')
      }
      setShowError(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-safety-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Meu Perfil</h1>

      <div className="bg-dark-graphite border border-stone/20 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-moss/30 flex items-center justify-center text-2xl font-bold text-safety-orange">
            {user?.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{user?.nome}</h2>
            <p className="text-stone text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone mb-1">Biografia</label>
            <textarea
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors resize-none"
              placeholder="Conte um pouco sobre você e suas aventuras..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone mb-1">Interesses Pessoais</label>
            <textarea
              value={interesses}
              onChange={(e) => setInteresses(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors resize-none"
              placeholder="Ex: trekking, ciclismo, escalada, rafting..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone mb-1">Data de Aniversário</label>
            <input
              type="date"
              value={dataAniversario}
              onChange={(e) => setDataAniversario(e.target.value)}
              className="w-full max-w-xs px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white focus:outline-none focus:border-safety-orange transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-safety-orange hover:bg-safety-orange/80 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </form>
      </div>

      <Modal open={showError} title="Erro" onClose={() => setShowError(false)}>
        <p className="text-stone">{error}</p>
      </Modal>

      <Modal open={showSuccess} title="Perfil Atualizado" onClose={() => setShowSuccess(false)}>
        <p className="text-stone">Suas informações foram salvas com sucesso!</p>
      </Modal>
    </div>
  )
}
