# Trilhas do Brasil — AGENTS.md

## Repo state

This is a **specification scaffold**, not a working codebase. Zero application code exists —
only `.gitignore` placeholders in `backend/`, `frontend/`, `docker/`, `storage/`. An AI
must **generate** the entire project following the prompts in this repo.

## Entry point

- `Prompt.txt` — master execution order; read this first.
- `Project.md` — product requirements (trail social‑network for Brazil).
- `config/` — technical specs. Four files are **mandatory**:
  `LoginConfig.md`, `SupabaseConfig.md`, `SecurityChecklist.md`, `TechSpecsConfig.md`.
  `DockerConfig.md` is also required for container setup.

## Architecture (mandated, not yet built)

```
backend/ (Clean Architecture)
  src/application/
  src/domain/
  src/infrastructure/
frontend/ (React + Vite + Tailwind + TypeScript)
  src/components/
  src/pages/
  src/hooks/
  src/services/
storage/          → runtime data, never edit manually
```

- **Backend**: Python FastAPI + SQLAlchemy + Alembic. Layers: domain → application → infrastructure.
  Dependency injection: service → controller, db → service.
- **Frontend**: React + Vite + Tailwind + TypeScript. Dashboard is homepage. Sidebar navigation.
- **IDs**: All entities use UUID.

## Do‑not‑violate rules

1. **Frontend communicates ONLY with backend** via REST API. No direct DB access, no Supabase SDK,
   no anon key, no `supabase-js`/`supabase-py`. The frontend never connects to any external service.
2. **Supabase is PostgreSQL only** — connection via `postgresql+asyncpg://...` string, never the
   Supabase REST API or SDK.
3. **No `alert()` or `confirm()`** — use Modal components.
4. **Brazilian locale**: dates, hours, numbers, currency.
5. **Secrets never in `VITE_*` env vars** — `JWT_SECRET`, `DATABASE_URL`, API keys on backend only.

## Build / run (will apply after generation)

- **Backend dev**: `uvicorn src.main:app --reload`
- **Frontend dev**: `npm run dev` (Vite)
- **Migrations**: `alembic upgrade head`
- **Docker**: compose at repo root. Health check backend before frontend. Bind‑mount `./storage:/storage`.
  Create `/storage` in backend Dockerfile before Alembic runs.
- **Storage**: SQLite default at `storage/app.db`. Ensure parent dir exists before connecting.

## Config files as source of truth

| File | What it mandates |
|---|---|
| `config/LoginConfig.md` | JWT auth: `/auth/register`, `/auth/token`, `/auth/password`. AuthContext, PrivateRoute, automatic 401 → logout. |
| `config/SupabaseConfig.md` | Async PostgreSQL via asyncpg. Backend‑only. Migrate from SQLite. |
| `config/SecurityChecklist.md` | No hardcoded secrets, bcrypt, JWT expiry, CORS restrictable, rate‑limit on auth routes, no stack traces in errors, logs without secrets. |
| `config/DockerConfig.md` | Two Dockerfiles, compose at root, storage bind‑mount, health check, no port 80 for backend. |
| `config/TechSpecsConfig.md` | Clean Architecture, DI, UUIDs, markdown fields, Vite env for public config only. |

## Validation before delivery (from SecurityChecklist)

1. Backend starts without errors.
2. Frontend compiles without errors.
3. Alembic migrations run successfully.
4. Docker compose brings up the environment.
5. No secrets in frontend bundle.
6. Private routes require Bearer token.
7. Frontend does not access Supabase directly.
8. CORS configurable per environment.
9. Rate limit exists on sensitive routes.
10. README documents env vars without exposing secrets.
