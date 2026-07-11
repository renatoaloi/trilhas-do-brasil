import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService, type UserResponse } from '../services/auth'

interface AuthContextType {
  user: { id: string; nome: string; email: string } | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updatePassword: (novaSenha: string, confirmarSenha: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; nome: string; email: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    const { access_token } = response.data
    localStorage.setItem('access_token', access_token)
    setToken(access_token)

    const decoded = JSON.parse(atob(access_token.split('.')[1]))
    const userData: UserResponse = {
      id: decoded.sub,
      nome: decoded.nome || '',
      email: decoded.email || email,
      ativo: true,
      created_at: '',
    }
    localStorage.setItem('user', JSON.stringify({ id: userData.id, nome: userData.nome, email: userData.email }))
    setUser({ id: userData.id, nome: userData.nome, email: userData.email })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }, [])

  const updatePassword = useCallback(async (novaSenha: string, confirmarSenha: string) => {
    await authService.changePassword({ nova_senha: novaSenha, confirmar_senha: confirmarSenha })
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
