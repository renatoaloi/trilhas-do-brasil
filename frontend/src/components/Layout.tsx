import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Modal } from './Modal'

const links = [
  { to: '/dashboard', label: 'Mapa', icon: '🗺' },
  { to: '/pivots', label: 'Pivots', icon: '📍' },
  { to: '/veiculos', label: 'Veículos', icon: '🚙' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
]

export function Layout() {
  const { user, logout, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [nova, setNova] = useState('')
  const [conf, setConf] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handlePassword() {
    setErr(null)
    setMsg(null)
    if (nova !== conf) {
      setErr('As senhas não conferem')
      return
    }
    setBusy(true)
    try {
      await updatePassword(nova, conf)
      setMsg('Senha alterada com sucesso')
      setNova('')
      setConf('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao alterar senha')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-forest-700 bg-forest-900/90 backdrop-blur sticky top-0 z-40">
        <div className="font-bold tracking-wide text-signal-400">Trilhas do Brasil</div>
        <button
          type="button"
          className="rounded-lg border border-forest-600 px-3 py-1"
          onClick={() => setMenuOpen((v) => !v)}
        >
          Menu
        </button>
      </header>

      <aside
        className={`${
          menuOpen ? 'flex' : 'hidden'
        } md:flex w-full md:w-64 shrink-0 flex-col border-r border-forest-700 bg-forest-900/95`}
      >
        <div className="hidden md:block px-5 py-6 border-b border-forest-700">
          <div className="text-xs uppercase tracking-[0.2em] text-moss-500">Pegada de Silício</div>
          <div className="text-xl font-bold text-signal-400 mt-1">Trilhas do Brasil</div>
          <p className="text-xs text-stone-400 mt-2">GPS social para aventureiros</p>
        </div>
        <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition ${
                  isActive
                    ? 'bg-forest-700 text-sand-400 font-semibold'
                    : 'text-stone-300 hover:bg-forest-800'
                }`
              }
            >
              <span className="mr-2">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-forest-700 space-y-2">
          <div className="text-sm text-stone-300 truncate">{user?.nome}</div>
          <div className="text-xs text-stone-500 truncate">{user?.email}</div>
          <button
            type="button"
            className="w-full rounded-lg border border-forest-600 px-3 py-2 text-sm hover:bg-forest-800"
            onClick={() => {
              setPwdOpen(true)
              setErr(null)
              setMsg(null)
            }}
          >
            Alterar senha
          </button>
          <button
            type="button"
            className="w-full rounded-lg bg-danger-500/20 text-red-300 px-3 py-2 text-sm hover:bg-danger-500/30"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-0">
        <Outlet />
      </main>

      <Modal
        open={pwdOpen}
        title="Alterar senha"
        onClose={() => setPwdOpen(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="rounded-lg px-4 py-2 border border-forest-600"
              onClick={() => setPwdOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg px-4 py-2 bg-signal-500 text-forest-950 font-semibold disabled:opacity-50"
              onClick={handlePassword}
            >
              Salvar
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm">
            Nova senha
            <input
              type="password"
              className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={nova}
              onChange={(e) => setNova(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Confirmar nova senha
            <input
              type="password"
              className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
              value={conf}
              onChange={(e) => setConf(e.target.value)}
            />
          </label>
          {err ? <p className="text-sm text-red-300">{err}</p> : null}
          {msg ? <p className="text-sm text-green-300">{msg}</p> : null}
        </div>
      </Modal>
    </div>
  )
}
