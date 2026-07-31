## Context

See proposal.md for motivation.

Current Dashboard offline flow (`frontend/src/pages/Dashboard.tsx`):
- Button opens modal with manual lat/lng + raio
- `POST /api/pivots/offline` with `{ latitude, longitude, raio_km }`
- Result saved to `localStorage` key `offline_pivots`

Map already supports:
- Pin click → detail (`onSelect`)
- Double-click empty map → create (`onPlaceRequest`)
- Bounds-filtered pin list

Backend offline endpoint needs no change (`OfflineDownloadRequest`).

## Goals / Non-Goals

**Goals:**
- Center-selection mode driven from Offline button
- Pin click as primary center source; lat/lng remain editable in the form
- Leaflet circle overlay for radius preview
- Pause create + detail on pin click while mode is active
- Keep existing API and localStorage behavior

**Non-Goals:**
- GPS as center (later)
- PivotDetail shortcut
- Dropdown of pins as primary UX
- Offline tile caching / service worker
- Backend changes

## Decisions

### 1. Selection mode owned by Dashboard

**Choice:** `offlineSelecting: boolean` (and related center/raio state) on Dashboard. `MapView` stays mostly presentational.

**Rationale:** Same pattern as create flow (`onPlaceRequest` / modal state on Dashboard).

**Alternative:** Global map interaction machine — overkill for one feature.

### 2. Bifurcate `onSelect` by mode

**Choice:**
```
onSelect(pivot) {
  if (offlineSelecting) → set center, open offline modal, stop
  else → open PivotDetail
}
```

**Rationale:** Reuses existing pin click wiring; no second click handler on markers.

### 3. Suppress create while selecting

**Choice:** Do not pass `onPlaceRequest` (or pass no-op / gate inside handler) while `offlineSelecting` is true.

**Rationale:** Avoid competing gestures; product decision from explore.

### 4. Radius circle on MapView

**Choice:** Optional prop, e.g.:
```ts
radiusOverlay?: { lat: number; lng: number; radiusKm: number } | null
```
Render Leaflet `Circle` with `radius: radiusKm * 1000` (meters). Style with theme signal/forest low opacity.

**Rationale:** MapView already owns Leaflet layers; Dashboard only supplies numbers from form state.

**Alternative:** Separate overlay component — unnecessary split.

### 5. When circle appears

**Choice:** Show once center coords + raio are known (after pin select / while modal open). Update on every lat/lng/raio change. Clear when mode ends and modal closes.

**Rationale:** Spec requires live preview and cleanup.

### 6. Modal content

**Choice:** Keep a single offline modal: center name (if from pin), lat, lng, raio, Baixar, result list. Lat/lng prefilled, editable. Primary path is pin select, not typing coords from empty.

**Rationale:** Product wants adjustability without forcing manual entry as the main path.

### 7. Empty pins

**Choice:** If `pivots.length === 0` when entering mode (or always show in banner), show short guidance in banner/modal area. Still allow cancel.

**Rationale:** Spec; avoids dead-end mode.

### 8. Exit paths

| Action | Effect |
|--------|--------|
| Cancel banner | clear mode, circle, center |
| Close modal without download | keep or exit mode? **Exit mode** for simplicity |
| Successful download | keep result in modal; user closes → exit mode |
| Change mind: pick another pin | optional: while modal open, allow re-click pin to change center — **nice**; if hard, close modal and re-enter select |

**Choice for v1:** Closing modal returns to normal map (exit mode). User hits Offline again to pick another center. Simpler state.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| User confused why detail doesn't open | Clear banner “escolha o centro · Cancelar” |
| Circle wrong units | Always convert km → meters for Leaflet |
| Huge radius (200 km) performance | Leaflet handles one Circle fine |
| Mode left stuck | Cancel + modal onClose always clear flags |
| Pin outside viewport can't be center | Expected for map-first A; user pans/filters |

## Migration Plan

- Frontend-only deploy
- Rollback: revert UI; API unchanged

## Open Questions

None blocking.
