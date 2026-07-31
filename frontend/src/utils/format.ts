const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const numberFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  return dateFmt.format(new Date(value))
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  return dateTimeFmt.format(new Date(value))
}

export function formatNumber(value: number): string {
  return numberFmt.format(value)
}

export function reputationColor(cor: string): string {
  switch (cor) {
    case 'verde':
      return '#22c55e'
    case 'verde_claro':
      return '#86efac'
    case 'laranja':
      return '#f4a261'
    case 'vermelho':
      return '#c1121f'
    default:
      return '#c4a574'
  }
}

export function renderMarkdownLite(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}
