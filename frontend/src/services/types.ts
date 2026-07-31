export type User = {
  id: string
  nome: string
  email: string
}

export type Profile = {
  id: string
  user_id: string
  avatar?: string | null
  biografia?: string | null
  interesses?: string | null
  data_aniversario?: string | null
  nome?: string
  email?: string
}

export type Vehicle = {
  id: string
  user_id: string
  marca: string
  modelo: string
  descricao?: string | null
  tipo: string
  created_at?: string
}

export type Pivot = {
  id: string
  user_id: string
  nome: string
  descricao?: string | null
  latitude: number
  longitude: number
  foto?: string | null
  tipo: string
  regiao?: string | null
  votos_positivos: number
  votos_negativos: number
  reputacao_score: number
  reputacao_cor: string
  created_at?: string
  distancia_km?: number
  pontos_atencao?: AttentionPoint[]
}

export type AttentionPoint = {
  id: string
  pivot_id: string
  user_id: string
  nome: string
  descricao?: string | null
  tipo: string
  created_at?: string
}

export type Comment = {
  id: string
  pivot_id: string
  user_id: string
  texto: string
  autor_nome?: string | null
  created_at?: string
}

export const TIPOS_PINO = [
  { value: 'a_pe', label: 'A pé' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'moto', label: 'Moto' },
  { value: 'jipe', label: 'Jipe' },
  { value: 'escalada', label: 'Escalada' },
  { value: 'aquatica', label: 'Aquática' },
  { value: 'quadriciclo', label: 'Quadriciclo' },
  { value: 'cavalo', label: 'Cavalo' },
  { value: 'mista', label: 'Mista' },
] as const

export const TIPOS_VEICULO = [
  { value: 'carro', label: 'Carro' },
  { value: 'moto', label: 'Moto' },
  { value: 'jipe', label: 'Jipe' },
  { value: 'tenis', label: 'Tênis' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'outros', label: 'Outros' },
] as const

export const TIPOS_ATENCAO = [
  { value: 'desmoronamento', label: 'Desmoronamento' },
  { value: 'ponto_intransponivel', label: 'Ponto intransponível' },
  { value: 'alagamento', label: 'Alagamento' },
  { value: 'propriedade_privada', label: 'Propriedade privada' },
  { value: 'perigo', label: 'Perigo' },
  { value: 'assalto', label: 'Assalto' },
  { value: 'queimada', label: 'Queimada' },
] as const
