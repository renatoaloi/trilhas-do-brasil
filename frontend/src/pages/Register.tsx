import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Modal } from '../components/Modal'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(nome, email, password)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-forest-600/60 bg-forest-900/90 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-signal-400 text-center">Criar conta</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            Nome
            <input
              required
              minLength={2}
              className="mt-1 w-full rounded-xl bg-forest-950 border border-forest-600 px-3 py-2.5"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
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
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-400">
          Já tem conta?{' '}
          <Link to="/login" className="text-sand-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
      <Modal open={!!error} title="Erro" onClose={() => setError(null)}>
        <p>{error}</p>
      </Modal>
      <Modal
        open={success}
        title="Cadastro realizado"
        onClose={() => navigate('/login')}
        footer={
          <button
            type="button"
            className="rounded-lg bg-signal-500 px-4 py-2 font-semibold text-forest-950"
            onClick={() => navigate('/login')}
          >
            Ir para login
          </button>
        }
      >
        <p>Conta criada com sucesso. Faça login para continuar.</p>
      </Modal>
    </div>
  )
}
