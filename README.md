# Trilhas do Brasil

Rede social / GPS colaborativo para trilheiros e turistas no Brasil. Mapa com pinos (pivots), votos de reputação, pontos de atenção, download offline por raio, veículos e perfil.

## Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy async, Alembic, JWT (pyjwt + bcrypt)
- **Banco:** PostgreSQL (Supabase ou Postgres local). SQLite suportado em desenvolvimento via `DATABASE_URL`
- **Frontend:** React + Vite + Tailwind + TypeScript
- **Mapas:** Leaflet + OpenStreetMap (gratuito, sem chave de API)
- **Docker:** Compose na raiz (Postgres + API + frontend)

## Requisitos

- Docker / Docker Compose **ou**
- Python 3.12+, Node.js 20+, opcionalmente PostgreSQL

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string async | `postgresql+asyncpg://user:pass@host:5432/db` ou `sqlite+aiosqlite:///./storage/app.db` |
| `JWT_SECRET` | Segredo JWT (**obrigatório em produção**) | string longa aleatória |
| `JWT_ALGORITHM` | Algoritmo | `HS256` |
| `JWT_EXPIRY` | Expiração em segundos | `3600` |
| `STORAGE_PATH` | Pasta de uploads | `./storage` ou `/storage` |
| `CORS_ORIGINS` | Origens permitidas (vírgula) | `http://localhost:5173,http://localhost:8080` |
| `RATE_LIMIT` | Limite em auth | `30/minute` |

Para **Supabase**, use a connection string do painel no formato:

```env
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<password>@aws-0-....pooler.supabase.com:6543/postgres?ssl=require
```

O backend **não** usa SDK Supabase — apenas PostgreSQL via SQLAlchemy/asyncpg.

### Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_BASE_URL` | Base da API **incluindo** `/api` | `http://localhost:8000/api` |

Mapa via Leaflet/OSM — não precisa de chave. **Nunca** coloque `JWT_SECRET`, `DATABASE_URL` ou chaves privadas em `VITE_*`.

## Docker Compose

```bash
# na raiz do projeto
docker compose up --build
```

- Frontend: http://localhost:8080  
- API: http://localhost:8000  
- Health: http://localhost:8000/api/health  
- Docs: http://localhost:8000/docs  

```bash
docker compose down
```

## Desenvolvimento manual

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # ou cp
# ajuste DATABASE_URL / JWT_SECRET
alembic upgrade head
uvicorn src.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

App em http://localhost:5173

### Testes backend

```bash
cd backend
pytest tests -q
```

## API principal (prefixo `/api`)

| Método | Rota | Auth |
|--------|------|------|
| GET | `/health` | não |
| POST | `/auth/register` | não |
| POST | `/auth/token` | não |
| PUT | `/auth/password` | sim |
| GET/PUT | `/perfil` | sim |
| CRUD | `/veiculos` | sim |
| CRUD | `/pivots` | sim |
| POST | `/pivots/offline` | sim (centro + raio_km) |
| POST | `/pivots/{id}/votos` | sim |
| GET/POST | `/pivots/{id}/comentarios` | sim |
| GET/POST | `/pivots/{id}/atencao` | sim |

## Segurança (checklist SaaS)

- JWT com expiração; senhas com bcrypt
- Rotas privadas com `Authorization: Bearer`
- Frontend só fala com o backend REST
- Rate limit em `/auth/register` e `/auth/token`
- CORS configurável; uploads com tipo/tamanho limitados
- Sem segredos no bundle frontend

## Estrutura

```
backend/src/{domain,application,infrastructure}
frontend/src/{components,pages,hooks,services}
storage/          # runtime only — não editar manualmente
docker-compose.yml
```
