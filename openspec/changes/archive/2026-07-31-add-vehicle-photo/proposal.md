## Why

Vehicle registration currently only stores text fields (brand, model, type, description). Users have no way to attach a photo to their vehicle, making the vehicle page less visual and less useful for quickly identifying which vehicle is which. Pivots and profiles already support photo uploads — vehicles should too.

## What Changes

- Add `foto` field to the vehicle data model (backend entity, SQLAlchemy model, Pydantic schema)
- Add `POST /api/veiculos/{vehicle_id}/foto` endpoint for uploading vehicle photos
- Add `VehicleService.set_foto()` method following the same pattern as `PivotService.set_foto()`
- Add Alembic migration to add nullable `foto` column to `vehicles` table
- Add photo picker and preview to the vehicle create/edit form on the frontend
- Add `foto` to the `Vehicle` TypeScript type

## Capabilities

### New Capabilities

- `vehicle-photo-upload`: Allow users to upload and display a photo for each vehicle they own.

### Modified Capabilities

None.

## Impact

- `backend/src/domain/entities.py` — add `foto` field to `Vehicle` dataclass
- `backend/src/application/schemas.py` — add `foto` to `VehicleResponse`
- `backend/src/application/services.py` — add `VehicleService.set_foto()`
- `backend/src/infrastructure/models.py` — add `foto` column to `VehicleModel`
- `backend/src/infrastructure/api/routes.py` — add `POST /veiculos/{id}/foto` route
- `backend/alembic/` — new migration for `foto` column
- `frontend/src/services/types.ts` — add `foto` to `Vehicle` type
- `frontend/src/pages/Vehicles.tsx` — add photo upload UI to create/edit form
- No new dependencies
