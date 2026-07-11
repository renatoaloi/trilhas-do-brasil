import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import Modal from '../components/Modal'

export default function Register() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register({ nome, email, password })
      setShowSuccess(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string }; status?: number } }
        if (axiosErr.response?.status === 409) {
          setError('Este email já está cadastrado.')
        } else {
          setError(axiosErr.response?.data?.detail || 'Erro ao cadastrar.')
        }
      } else {
        setError('Erro ao cadastrar.')
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
          <p className="text-stone mt-2">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors"
              placeholder="Seu nome"
            />
          </div>

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
              minLength={6}
              className="w-full px-3 py-2.5 bg-dark-graphite border border-stone/30 rounded-lg text-white placeholder-stone/50 focus:outline-none focus:border-safety-orange transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-safety-orange hover:bg-safety-orange/80 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-stone text-sm mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-safety-yellow hover:underline">Faça login</Link>
        </p>

        <Modal open={showError} title="Erro" onClose={() => setShowError(false)}>
          <p className="text-stone">{error}</p>
        </Modal>

        <Modal
          open={showSuccess}
          title="Conta criada"
          onClose={() => { setShowSuccess(false); navigate('/login') }}
          actions={
            <button
              onClick={() => { setShowSuccess(false); navigate('/login') }}
              className="px-4 py-2 bg-moss hover:bg-moss/80 text-white font-medium rounded-lg transition-colors"
            >
              Ir para Login
            </button>
          }
        >
          <p className="text-stone">Cadastro realizado com sucesso! Faça login para continuar.</p>
        </Modal>
      </div>
    </div>
  )
}
