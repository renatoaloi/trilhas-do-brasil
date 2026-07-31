## Context

Vehicles currently store only text fields. Pivots and profiles already support photo uploads via a shared `save_upload()` function and a `{entity_id}/{subfolder}/` storage layout. Vehicles lack a `foto` column, an upload route, and upload UI in the form.

## Goals / Non-Goals

**Goals:**
- Add `foto` column to `vehicles` table (nullable `String(500)`)
- Add `POST /api/veiculos/{vehicle_id}/foto` route mirroring the pivot photo route
- Add `VehicleService.set_foto()` method mirroring `PivotService.set_foto()`
- Add `foto` to `VehicleResponse` schema
- Add Alembic migration for the new column
- Add photo picker + preview to the vehicle create/edit form in `Vehicles.tsx`

**Non-Goals:**
- Changing the existing `POST /veiculos` or `PUT /veiculos/{id}` endpoints to accept photos inline
- Adding photo editing or deletion endpoints
- Changing file storage mechanism or allowed image types

## Decisions

### Separate upload endpoint (`POST /veiculos/{id}/foto`)

Follow the pivot pattern: create/update the vehicle record first, then upload the photo via a dedicated endpoint. The frontend form saves the vehicle first, then uploads the photo if a file was selected.

**Rationale:** Consistency with the existing pivot photo flow. Keeps JSON and multipart concerns separated. The `save_upload()` function is already built and tested.

**Alternative considered:** Accept photo inline in `POST /veiculos` via multipart form. Rejected because it would require a different request format than the current JSON-based form and break consistency with pivots.

### Frontend: two-step in form

The `Vehicles.tsx` form adds a file input. On save:
1. POST or PUT the vehicle with text fields (JSON, as today)
2. If a file was selected, POST to `/veiculos/{new_id}/foto` with the file

The existing `api()` helper already handles JSON requests. For the file upload, a separate `fetch()` call with `FormData` is needed (or a small helper), matching how pivots upload photos.

**Rationale:** The `api()` helper auto-sets `Content-Type: application/json`. A file upload needs `multipart/form-data`, so a direct `fetch()` or a new helper is necessary. For simplicity and consistency, a direct `fetch()` call in the component is sufficient.

### Photo preview in vehicle cards

Display the photo as a thumbnail (matching pivot card style: `w-28 h-28 rounded-xl`) on each vehicle card. Use `fileUrl(v.foto)` from the existing API helper. If no photo, show no placeholder — the card remains as it is today.

### Storage path: `storage/{vehicle_id}/foto/`

Use the existing `save_upload(entity_id, file, "foto")` with the vehicle UUID. Path format: `{vehicle_id}/foto/{random_hex}.{ext}`. This is identical to the pivot pattern and requires no changes to `save_upload()` or `resolve_storage_path()`.

## Risks / Trade-offs

- **[Risk]** Alembic migration adds nullable column — safe for existing data. **[Mitigation]** Column defaults to `NULL`; no data migration needed.
- **[Risk]** Frontend upload uses `fetch()` directly instead of the `api()` helper due to `multipart/form-data`. **[Mitigation]** The pattern is already used elsewhere (pivot photo upload); extract token from localStorage the same way `api()` does it.
