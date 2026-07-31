## Context

See proposal.md for motivation.

Current UI split:
- **Dashboard** (`frontend/src/pages/Dashboard.tsx`): Leaflet map via `MapView`, bounds-filtered `GET /pivots`, pin detail via `PivotDetail`. No create flow.
- **Pivots** (`frontend/src/pages/Pivots.tsx`): list + inline create modal (`POST /pivots`, optional `POST /pivots/{id}/foto`) with manual lat/lng.
- **MapView** (`frontend/src/components/MapView.tsx`): `useMapEvents` for bounds only; pin `click` → `onSelect`; Leaflet default `doubleClickZoom` is on.

Constraints: frontend talks only to REST under `/api`; no backend change needed; no `alert()`/`confirm()` (use `Modal`); mobile-first but v1 gesture is double-click/tap.

## Goals / Non-Goals

**Goals:**
- Wire map double-click → create modal with coords on Dashboard
- Share one create form between Dashboard and Pivots
- Disable map double-click zoom when placement callback is active
- Keep single-click pin detail unchanged

**Non-Goals:**
- Backend/API/schema changes
- Right-click / long-press / FAB “place mode” (future)
- Ghost/preview marker while modal is open (optional polish, not required for v1)
- Creating pivots from any map other than Dashboard
- Changing offline download UX

## Decisions

### 1. Gesture: double-click / double-tap (`dblclick`)

**Choice:** Leaflet `dblclick` via `useMapEvents`, not `contextmenu`.

**Rationale:** Product decision; avoids browser context menu; works with mouse and often with double-tap on touch when zoom-on-dblclick is off.

**Alternative considered:** Right-click — rejected for this change. FAB + single-tap place mode — deferred.

### 2. Disable `doubleClickZoom` when placement is enabled

**Choice:** Pass `doubleClickZoom={false}` on `MapContainer` when `onPlaceRequest` is provided (Dashboard).

**Rationale:** Default Leaflet zoom-on-dblclick would fight create. Zoom remains via controls, scroll wheel, and pinch.

### 3. Callback on `MapView`, orchestration on Dashboard

**Choice:**
```ts
onPlaceRequest?: (coords: { lat: number; lng: number }) => void
```
`MapView` only emits coords; Dashboard opens modal and owns create state.

**Rationale:** Keeps map presentational; matches existing `onSelect` / `onBoundsChange` pattern.

### 4. Extract shared create UI

**Choice:** Extract form + submit logic from `Pivots.tsx` into something like `CreatePivotModal` (or equivalent) accepting:
- `open`, `onClose`, `onCreated(pivot)`
- optional `initialCoords?: { lat: number; lng: number }`

**Rationale:** Avoid duplicating POST + foto upload; Pivots “Novo pino” reuses without initial coords.

**API reuse:** Same endpoints as today — `POST /pivots` JSON body, then optional `POST /pivots/{id}/foto` multipart.

### 5. Direct modal, no intermediate menu

**Choice:** dblclick → open create modal immediately.

**Rationale:** Fewer steps; product preference.

### 6. Pin click vs map dblclick

**Choice:** No special handling beyond existing marker `click` → detail. Map `dblclick` on empty area creates. Overlap (dblclick on marker) is acceptable edge case for v1 (may open detail on first click and/or create nearby).

**Alternative considered:** `stopPropagation` on marker dblclick only — optional later if noisy.

### 7. Discoverability

**Choice:** Short static hint in Dashboard header subtitle/area (pt-BR).

**Rationale:** Low cost; gesture is not obvious.

### 8. After create on Dashboard

**Choice:** On success: close modal, call existing bounds-aware `load` (or last known bounds) so the new pin appears if inside viewport.

**Rationale:** Reuses current query path; no new list endpoint.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users lose zoom-on-double-click | Zoom controls + scroll/pinch remain; acceptable trade-off |
| Accidental create on double-tap while panning | Modal requires explicit save; cancel/close discards |
| Double-tap vs browser zoom on some mobile WebViews | `doubleClickZoom={false}` helps; if flaky, future FAB place mode |
| dblclick on existing pin feels odd | v1 accept; refine only if reported |
| Form extraction regressions on Pivots page | Keep same fields/validation UX; smoke both entry points |

## Migration Plan

- Pure frontend deploy; no DB/migration/API versioning
- Rollback: revert frontend commit; no data migration

## Open Questions

None blocking. Optional later: ghost marker while modal open; FAB place mode for mobile.
