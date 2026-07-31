const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '')

type LogoutHandler = () => void
let onUnauthorized: LogoutHandler | null = null

export function setUnauthorizedHandler(handler: LogoutHandler) {
  onUnauthorized = handler
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) return data.detail.map((d: { msg?: string }) => d.msg).join(', ')
    return res.statusText || 'Erro na requisição'
  } catch {
    return res.statusText || 'Erro na requisição'
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    onUnauthorized?.()
    throw new ApiError(401, 'Não autenticado')
  }
  if (!res.ok) throw new ApiError(res.status, await parseError(res))
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function fileUrl(relative?: string | null): string | undefined {
  if (!relative) return undefined
  const token = getToken()
  const q = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${API_BASE}/files/${relative}${q}`
}
