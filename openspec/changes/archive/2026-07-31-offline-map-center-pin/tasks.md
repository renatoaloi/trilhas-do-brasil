## 1. MapView radius overlay

- [x] 1.1 Add optional `radiusOverlay?: { lat: number; lng: number; radiusKm: number } | null` to `MapView`
- [x] 1.2 Render Leaflet `Circle` (radius in meters = km × 1000) with theme-appropriate style when overlay is set
- [x] 1.3 Clear circle when overlay is null/undefined

## 2. Dashboard offline selection mode

- [x] 2.1 Add state: selection mode flag, selected center pin (optional), center lat/lng, raio, modal open, result (reuse existing where possible)
- [x] 2.2 Offline button enters selection mode with banner/hint ("Clique em um pino…") and Cancel
- [x] 2.3 Cancel / exit clears mode, circle, center, and closes offline modal without download
- [x] 2.4 While selecting: pin click sets center from pivot, prefills lat/lng, opens offline modal; does not open `PivotDetail`
- [x] 2.5 While selecting: do not open create-pivot on map double-click (gate `onPlaceRequest`)
- [x] 2.6 When not selecting: pin click and double-click create behave as today
- [x] 2.7 Show guidance if entering mode with no visible pins

## 3. Offline modal and download

- [x] 3.1 Modal shows center name (when from pin), editable lat/lng, raio, Baixar, and result list
- [x] 3.2 Wire `radiusOverlay` from current form lat/lng/raio while center is defined / modal open
- [x] 3.3 Keep `POST /pivots/offline` + localStorage save; on success show result; on close exit selection mode
- [x] 3.4 Errors via existing Modal pattern (no `alert`)

## 4. Verification

- [x] 4.1 Manual: Offline → click pin → circle + modal → edit raio/coords → Baixar → pins saved
- [x] 4.2 Manual: Cancel mode; after exit, pin click opens detail and dblclick create works
- [x] 4.3 Run frontend typecheck/lint if available
