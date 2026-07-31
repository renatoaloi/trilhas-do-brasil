## 1. Backend: data model and schema

- [x] 1.1 Add `foto: Optional[str] = None` field to `Vehicle` dataclass in `backend/src/domain/entities.py`
- [x] 1.2 Add `foto: Optional[str] = None` to `VehicleResponse` in `backend/src/application/schemas.py`
- [x] 1.3 Add `foto: Mapped[str | None] = mapped_column(String(500), nullable=True)` to `VehicleModel` in `backend/src/infrastructure/models.py`

## 2. Backend: upload endpoint and service

- [x] 2.1 Add `VehicleService.set_foto()` method mirroring `PivotService.set_foto()` in `backend/src/application/services.py` (load vehicle, check ownership, set `foto`, flush, reload, return response dict)
- [x] 2.2 Add `POST /veiculos/{vehicle_id}/foto` route in `backend/src/infrastructure/api/routes.py` using `save_upload(vehicle_id, file, "foto")` and `VehicleService.set_foto()`

## 3. Database migration

- [x] 3.1 Generate Alembic migration for `foto` column on `vehicles` table (`alembic revision --autogenerate -m "add_foto_to_vehicles"`)
- [x] 3.2 Verify migration applies cleanly (`alembic upgrade head`)

## 4. Frontend: type and photo picker

- [x] 4.1 Add `foto?: string | null` to `Vehicle` type in `frontend/src/services/types.ts`
- [x] 4.2 Add `fileUrl` import and `fotoFile` state to `Vehicles.tsx`
- [x] 4.3 Add file input and photo preview to the create/edit form modal in `Vehicles.tsx`
- [x] 4.4 In `onSubmit`, after vehicle create/update, upload photo via `FormData` to `/veiculos/{id}/foto` if a file was selected, then update state with result

## 5. Frontend: photo display in vehicle cards

- [x] 5.1 Add photo thumbnail (using `fileUrl`) to each vehicle card in `Vehicles.tsx`, matching pivot card style (`w-28 h-28 rounded-xl`)

## 6. Verification

- [x] 6.1 Run `npm run build` in frontend to verify no TypeScript or build errors
- [x] 6.2 Manual test: create a vehicle with a photo, verify photo appears on the card
- [x] 6.3 Manual test: edit a vehicle and change its photo, verify photo updates
- [x] 6.4 Manual test: create a vehicle without photo, verify no image is shown and no errors
