import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Modal from './Modal'

export default function PasswordChange() {
  const { updatePassword } = useAuth()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(novaSenha, confirmarSenha)
      setNovaSenha('')
      setConfirmarSenha('')
      setSuccess('Senha alterada com sucesso!')
      setShowSuccessModal(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Erro ao alterar senha.')
      } else {
        setError('Erro ao alterar senha.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Alterar Senha</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger-red/10 border border-danger-red/30 text-danger-red px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone mb-1">Nova Senha</label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors"
            placeholder="Nova senha"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone mb-1">Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors"
            placeholder="Confirmar nova senha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-safety-orange hover:bg-safety-orange/80 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      <Modal open={showSuccessModal} title="Sucesso" onClose={() => setShowSuccessModal(false)}>
        <p className="text-stone">{success}</p>
      </Modal>
    </div>
  )
}
