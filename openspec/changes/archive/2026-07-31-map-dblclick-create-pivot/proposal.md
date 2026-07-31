## Why

Criar um pino hoje exige ir à lista Pivots e digitar latitude/longitude manualmente — fricção alta num app map-first. O usuário já está no mapa olhando o ponto; deve poder criar o pivot dali, com coordenadas capturadas do clique.

## What Changes

- Duplo clique (ou duplo toque) em área vazia do mapa no Dashboard abre o modal de criação de pivot com lat/lng pré-preenchidos a partir da posição do clique
- Latitude e longitude permanecem editáveis no formulário (ajuste fino / arredondamento)
- Clique simples em um pino existente continua abrindo o painel de detalhes (sem mudança de comportamento)
- Zoom por duplo clique do Leaflet desativado no mapa do Dashboard para não competir com a criação
- Formulário de criação extraído para componente reutilizável; a página Pivots passa a usá-lo (coords vazias no fluxo “Novo pino”)
- Hint de descobrabilidade no header do Mapa (ex.: “Duplo clique no mapa para criar um pino”)
- Sem mudanças de API backend

## Capabilities

### New Capabilities

- `map-pivot-create`: Criação de pivot a partir do mapa (duplo clique → modal com coords) e reuso do formulário de criação no Dashboard e na lista Pivots

### Modified Capabilities

- (nenhuma — `openspec/specs/` ainda não tem capabilities baseline)

## Impact

- **Frontend**: `MapView.tsx` (callback + `doubleClickZoom`), `Dashboard.tsx` (modal + refresh), novo componente de formulário/modal de criação, `Pivots.tsx` (refator para reusar o form)
- **Backend / API**: nenhum
- **Auth / Docker / DB**: nenhum
