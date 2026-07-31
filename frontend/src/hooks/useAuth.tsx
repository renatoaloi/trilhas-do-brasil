import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, setToken, setUnauthorizedHandler, getToken } from '../services/api'
import type { User } from '../services/types'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nome: string, email: string, password: string) => Promise<void>
  logout: () => void
  updatePassword: (novaSenha: string, confirmarSenha: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return
    }
    const me = await api<User>('/me')
    setUser(me)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null)
      setUser(null)
    })
    ;(async () => {
      try {
        if (getToken()) await refreshUser()
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    })()
  }, [logout, refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ access_token: string }>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.access_token)
    const me = await api<User>('/me')
    setUser(me)
  }, [])

  const register = useCallback(async (nome: string, email: string, password: string) => {
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, password }),
    })
  }, [])

  const updatePassword = useCallback(async (novaSenha: string, confirmarSenha: string) => {
    await api('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ nova_senha: novaSenha, confirmar_senha: confirmarSenha }),
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updatePassword,
      refreshUser,
    }),
    [user, loading, login, register, logout, updatePassword, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
