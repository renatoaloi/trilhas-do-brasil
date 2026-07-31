import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/Modal'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-forest-600/60 bg-forest-900/90 p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-moss-500">Aventura conectada</div>
          <h1 className="mt-2 text-3xl font-bold text-signal-400">Trilhas do Brasil</h1>
          <p className="mt-2 text-sm text-stone-400">Entre para explorar pinos, alertas e rotas</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl bg-forest-950 border border-forest-600 px-3 py-2.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Senha
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-xl bg-forest-950 border border-forest-600 px-3 py-2.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-signal-500 py-3 font-semibold text-forest-950 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-400">
          Novo por aqui?{' '}
          <Link to="/register" className="text-sand-400 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p className="text-stone-200">{error}</p>
      </Modal>
    </div>
  )
}
