import api from './api'

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  nome: string
  email: string
  ativo: boolean
  created_at: string
}

export interface TrailResponse {
  id: string
  nome: string
  nome_social?: string
  trail_type_id?: string
  descricao?: string
  latitude: number
  longitude: number
  dificuldade?: string
  distancia_km?: number
  elevacao_m?: number
  duracao_estimada?: string
  condicoes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface PivotResponse {
  id: string
  trail_id: string
  user_id: string
  pivot_type_id: string
  descricao: string
  latitude: number
  longitude: number
  created_at: string
}

export interface ProfileResponse {
  id: string
  user_id: string
  avatar?: string
  biografia?: string
  interesses_pessoais?: string
  data_aniversario?: string
}

export const authService = {
  register: (data: { nome: string; email: string; password: string }) =>
    api.post<UserResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/token', data),
  changePassword: (data: { nova_senha: string; confirmar_senha: string }) =>
    api.put('/auth/password', data),
}

export const trailService = {
  list: () => api.get<TrailResponse[]>('/trails'),
  getById: (id: string) => api.get<TrailResponse>(`/trails/${id}`),
  search: (q: string) => api.get<TrailResponse[]>('/trails/search', { params: { q } }),
  create: (data: Partial<TrailResponse>) => api.post<TrailResponse>('/trails', data),
  update: (id: string, data: Partial<TrailResponse>) => api.put<TrailResponse>(`/trails/${id}`, data),
  delete: (id: string) => api.delete(`/trails/${id}`),
}

export const pivotService = {
  getByTrail: (trailId: string) => api.get<PivotResponse[]>(`/pivots/trail/${trailId}`),
  create: (data: Partial<PivotResponse>) => api.post<PivotResponse>('/pivots', data),
  delete: (id: string) => api.delete(`/pivots/${id}`),
}

export const profileService = {
  getMe: () => api.get<ProfileResponse>('/profiles/me'),
  updateMe: (data: Partial<ProfileResponse>) => api.put<ProfileResponse>('/profiles/me', data),
}
