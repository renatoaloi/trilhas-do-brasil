## Why

O download offline pede latitude/longitude manuais, embora o produto exija escolher um **pino central** e um raio. Isso gera fricção e desalinha o botão Offline do fluxo map-first já usado no Dashboard.

## What Changes

- Botão Offline entra em **modo de seleção de centro**: o usuário clica em um pino no mapa para defini-lo como centro
- Banner/hint com instrução e ação Cancelar enquanto o modo está ativo
- Após escolher o pino, abre o modal offline com nome do centro, lat/lng **pré-preenchidos e editáveis**, e raio em km
- Mapa exibe um **círculo visual** do raio (atualiza ao mudar raio ou coordenadas)
- Enquanto o modo offline estiver ativo: click no pino **não** abre detalhe; double-click **não** abre criar pino
- API `POST /pivots/offline` e persistência em localStorage permanecem iguais
- Fora de escopo: GPS como centro, atalho no PivotDetail, lista dropdown de pinos

## Capabilities

### New Capabilities

- `offline-map-download`: Fluxo de download offline centrado em pino no mapa (modo seleção, modal, círculo de raio, resultado)

### Modified Capabilities

- `map-pivot-create`: Click simples e double-click no mapa respeitam o modo de seleção offline (não abrem detalhe/criar enquanto o modo estiver ativo)

## Impact

- **Frontend**: `Dashboard.tsx` (estado do modo offline), `MapView.tsx` (overlay de raio, possível highlight do centro), modal offline
- **Backend / API**: nenhum
- **Auth / Docker / DB**: nenhum
