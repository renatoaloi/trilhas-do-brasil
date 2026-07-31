## Why

Users browsing their own pivots on the list page have no quick way to see where a pivot is located on the map. They must manually switch to the map page and pan/zoom to find it. A "Ver no Mapa" button bridges the list and map views.

## What Changes

- Add a "Ver no Mapa" button on each pivot card in the pivots list page (`/pivots`). Since the page only shows pivots owned by the user, the button appears on all cards.
- Clicking the button navigates to `/dashboard` and passes the pivot's coordinates via React Router state.
- The dashboard (map) page reads the coordinates and passes them to `MapView` as a `center` prop, causing the map to animate to that pivot's location.
- No API changes — the map's existing bounds-based pivot loading naturally fetches pivots around the new center after the `moveend` event.

## Capabilities

### New Capabilities

- `view-pivot-on-map`: Navigate from the pivots list page to the map page with the map centered on a specific pivot.

### Modified Capabilities

None.

## Impact

- `frontend/src/pages/Pivots.tsx` — add "Ver no Mapa" button and `useNavigate` call
- `frontend/src/pages/Dashboard.tsx` — read `location.state`, store `center` state, pass to `MapView`
- No backend changes
- No new dependencies
