## 1. Map page: accept center from route state

- [x] 1.1 Import `useLocation`, `useRef` from react-router-dom in `frontend/src/pages/Dashboard.tsx`
- [x] 1.2 Add `viewCenter` state and `lastKey` ref to track incoming navigation center
- [x] 1.3 Add `useEffect` that reads `location.state?.center` on new navigations (via `location.key`) and sets `viewCenter`
- [x] 1.4 Pass `center={viewCenter}` to the `MapView` component

## 2. Pivots page: add "Ver no Mapa" button

- [x] 2.1 Import `useNavigate` from react-router-dom in `frontend/src/pages/Pivots.tsx`
- [x] 2.2 Add "Ver no Mapa" button to the action button group on each pivot card
- [x] 2.3 On click, call `navigate('/dashboard', { state: { center: { lat: p.latitude, lng: p.longitude } } })`

## 3. Verification

- [x] 3.1 Run `npm run build` in frontend to verify no TypeScript or build errors
- [x] 3.2 Manual test: click "Ver no Mapa" on a pivot, verify map opens and animates to that pivot's location
- [x] 3.3 Manual test: navigate to `/dashboard` via sidebar, verify map uses default centering (geolocation or Brasilia)
