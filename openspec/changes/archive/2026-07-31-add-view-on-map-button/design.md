## Context

The pivots list page (`/pivots`) shows cards with action buttons. The map page (`/dashboard`) uses a `MapView` component that already accepts an optional `center` prop to override the default centering logic. React Router is already set up for navigation between pages. The `center` prop feeds into a `Recenter` subcomponent that calls `map.setView()` with animation.

## Goals / Non-Goals

**Goals:**
- Add a "Ver no Mapa" button on each pivot card in the pivots list
- Navigate to `/dashboard` with pivot coordinates in route state
- Dashboard reads the state and passes `center` to `MapView`
- Map animates to the pivot's location

**Non-Goals:**
- Auto-opening the pivot detail modal on the map
- Changing map zoom level beyond the default (12)
- Highlighting or marking the target pivot specially
- Modifying backend or API

## Decisions

### Pass coordinates via React Router `location.state`

Use `navigate('/dashboard', { state: { center: { lat, lng } } })` rather than URL search params (`?lat=...&lng=...`) or a global state store.

**Rationale:** Coordinates don't need to be bookmarkable or shareable — this is a transient UI action. Route state keeps the URL clean and is the idiomatic React Router approach for passing data between routes.

**Alternative considered:** URL search params (`?lat=-23.5&lng=-46.6`). Rejected because params persist on refresh/reload and clutter the URL for a one-shot centering action.

### Consume state only on new navigations using `location.key`

Dashboard reads `location.state?.center` but only acts on it when `location.key` is new (previously unseen). This prevents re-centering on re-renders and ensures sidebar navigations (which have no state) don't interfere.

```tsx
const location = useLocation()
const [viewCenter, setViewCenter] = useState<{lat:number, lng:number}|null>(null)
const lastKey = useRef('')

useEffect(() => {
  const navCenter = (location.state as any)?.center
  if (navCenter && location.key !== lastKey.current) {
    lastKey.current = location.key
    setViewCenter(navCenter)
  }
}, [location.state, location.key])
```

### Keep `viewCenter` in Dashboard state indefinitely

Once set, `viewCenter` stays set for the session. Consequence: if the user then uses geolocation or manually pans away, the `Recenter` won't fire again since the center value is stable. Only a new "Ver no Mapa" navigation (new `location.key`) updates it.

**Rationale:** Simpler than trying to clear the override — the user already saw the pivot, and the map is now in a meaningful location. The `Recenter` only re-fires on value change, so it's a one-shot animation per navigation.

## Risks / Trade-offs

- **[Risk]** React Router `location.key` is not strictly guaranteed to be a string in all router versions. **[Mitigation]** React Router v6 uses string keys in `BrowserRouter`; project is already locked to v6.
- **[Risk]** If the target pivot falls outside the initial bounds-based API load (unlikely at zoom 12), the marker won't appear until the user pans. **[Mitigation]** Bounds-based load fires immediately after `Recenter`'s `map.setView()` triggers `moveend`, so the pivot should be within the loaded area. Mitigation deemed sufficient.
