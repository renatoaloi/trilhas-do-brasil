import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { ReactNode } from 'react'

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
