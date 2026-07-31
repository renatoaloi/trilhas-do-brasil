## 1. Shared create form

- [x] 1.1 Extract create-pivot form + submit (POST `/pivots`, optional foto upload) from `Pivots.tsx` into `CreatePivotModal` (or equivalent) with props `open`, `onClose`, `onCreated`, optional `initialCoords`
- [x] 1.2 Prefill lat/lng from `initialCoords` when provided; keep both fields editable and required for submit
- [x] 1.3 Refactor `Pivots.tsx` to open the shared modal via “Novo pino” without initial coords; preserve list update on create

## 2. MapView placement gesture

- [x] 2.1 Add optional `onPlaceRequest?: (coords: { lat: number; lng: number }) => void` to `MapView`
- [x] 2.2 Handle Leaflet `dblclick` via `useMapEvents` and call `onPlaceRequest` with `e.latlng`
- [x] 2.3 Set `doubleClickZoom={false}` on `MapContainer` when `onPlaceRequest` is provided
- [x] 2.4 Confirm single-click on pin markers still only triggers `onSelect` (detail)

## 3. Dashboard integration

- [x] 3.1 Wire `onPlaceRequest` on Dashboard to open `CreatePivotModal` with clicked coords
- [x] 3.2 On successful create: close modal, refresh pivots for current map bounds so the new pin appears when in viewport
- [x] 3.3 Add pt-BR discoverability hint on Mapa header (double-click creates a pin)
- [x] 3.4 Ensure create errors use existing Modal pattern (no `alert`)

## 4. Verification

- [x] 4.1 Manual check: dblclick empty map → modal with coords → edit lat/lng → save → pin on map
- [x] 4.2 Manual check: single-click pin → detail only; Pivots “Novo pino” still works
- [x] 4.3 Run frontend typecheck/lint if available in the project
