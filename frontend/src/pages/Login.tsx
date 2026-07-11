import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Modal from '../components/Modal'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Email ou senha inválidos.')
      } else {
        setError('Erro ao fazer login.')
      }
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-safety-orange">Trilhas do Brasil</h1>
          <p className="text-stone mt-2">Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-safety-orange hover:bg-safety-orange/80 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-stone text-sm mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-safety-yellow hover:underline">Cadastre-se</Link>
        </p>

        <Modal open={showError} title="Erro" onClose={() => setShowError(false)}>
          <p className="text-stone">{error}</p>
        </Modal>
      </div>
    </div>
  )
}
