# AGENTS.md

Spec package for **Trilhas do Brasil** (Pegada de Silício). App code is not built yet — only `Project.md`, `Prompt.txt`, and `config/*`. `backend/` and `frontend/` are stubs (`.gitignore` only).

## Read order (do not skip)

1. `Prompt.txt` — execution order and **mandatory** SaaS extensions for this profile
2. `Project.md` — product/business/visual requirements
3. `config/TechSpecsConfig.md`, `DockerConfig.md`, `LoginConfig.md`, `SupabaseConfig.md`, `SecurityChecklist.md`

Prefer those files over this summary when details conflict in nuance. If specs disagree on optionality, **`Prompt.txt` wins for this package**.

## Non-negotiables

- **Never write/edit `storage/`** — runtime only (DB files, uploads). Bind-mount in Docker; create `/storage` in backend image before Alembic.
- **Frontend ↔ backend only** via REST. No direct DB, no Supabase/Firebase SDKs, no third-party data clients in the browser.
- **JWT + Supabase are required** here (not optional). `LoginConfig.md` / `SupabaseConfig.md` prose about “only when user asks” does **not** apply to this profile.
- Supabase = **managed PostgreSQL only**: `postgresql+asyncpg://...` in backend. No `supabase-py`, no Supabase REST, no anon/service_role keys anywhere.
- All public API routes under **`/api`**. Mount routers with `prefix="/api"`; do not mix prefixed and bare paths.
- **`/api/health`** must be unauthenticated (no API key/JWT). Used by Docker healthchecks.
- `VITE_API_BASE_URL` **must include** `/api` (e.g. `http://localhost:8000/api`). Service paths are relative only (`/health`, `/auth/token`) — never `/api/...` again (avoids `/api/api/...`).
- No secrets in `VITE_*` or frontend bundle. `JWT_SECRET`, `DATABASE_URL`, etc. backend-only.
- No `alert()` / `confirm()` — use Modal components.
- Entity IDs: **UUID**. Uploads: `storage/<entity_id>/`.
- Backend port: **not 80**. Frontend compose port example: **8080**. Install **wget** in backend image for healthcheck.

## Target stack (when implementing)

| Layer | Choice |
|--------|--------|
| Backend | Python, FastAPI, SQLAlchemy, Alembic, Clean Architecture (`domain` / `application` / `infrastructure`) |
| Auth | JWT (`pyjwt` + `bcrypt`): `POST /auth/register`, `POST /auth/token`, `PUT /auth/password` (authenticated; no current password) |
| DB | Production path: Supabase PostgreSQL async (`asyncpg` + `greenlet`). Local MVP docs mention SQLite under `storage/` — ensure parent dir of `DATABASE_URL` exists before engine/Alembic |
| Frontend | React + Vite + Tailwind + TypeScript; sidebar: Mapa, Pivots, Veículos, Perfil; initial page = dashboard; `PrivateRoute` + AuthContext; pt-BR dates/numbers |
| Maps | Leaflet + OpenStreetMap (no API key). Never put backend secrets in `VITE_*` |
| Docker | Root compose; `./storage:/storage`; frontend waits on API health |

## Auth routes note

Auth paths above are relative to the `/api` mount → public URLs are `/api/auth/register`, `/api/auth/token`, `/api/auth/password`. Protect CRUD with `get_current_user`; on frontend 401 → logout.

## Verification before “done”

- Backend starts; frontend builds; `alembic upgrade head` OK; compose up OK
- `SecurityChecklist.md` satisfied (no frontend secrets, bearer on private routes, rate limit on auth/public, CORS configurable for prod)
- README documents env vars and run commands **without real secrets**

## Product one-liner

Social/GPS-style trail app for Brazil: map-first pins (pivots), votes → green→red reputation, offline pin download by center+radius, attention points, vehicles, profiles; mobile-first dark forest/adventure theme (see `Project.md`).
