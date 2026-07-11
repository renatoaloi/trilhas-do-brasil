# Trilhas do Brasil

Rede social para trilheiros — um Waze para trilhas no Brasil. Navegação, pontos de interesse, alertas de perigo e compartilhamento de rotas.

## Stack

- **Backend**: Python FastAPI + SQLAlchemy + Alembic (Clean Architecture)
- **Frontend**: React + Vite + Tailwind + TypeScript
- **Database**: SQLite (dev) / PostgreSQL via Supabase (produção)
- **Auth**: JWT com bcrypt
- **Container**: Docker Compose

## Requisitos

- Python 3.12+
- Node.js 20+
- Docker (opcional)

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | Connection string do banco | `sqlite:///./storage/app.db` |
| `JWT_SECRET` | Chave para assinar tokens JWT | `dev-secret-change-in-production` |
| `JWT_ALGORITHM` | Algoritmo JWT | `HS256` |
| `JWT_EXPIRY` | Expiração do token (segundos) | `3600` |
| `CORS_ORIGINS` | Origens permitidas (separadas por vírgula) | `http://localhost:5173,http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_BASE_URL` | URL base da API | `http://localhost:8000` |

## Desenvolvimento

### Backend

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose

```bash
docker compose up --build
```

O frontend estará em `http://localhost:8080` e o backend em `http://localhost:8000`.

## Migrations

```bash
cd backend
alembic revision --autogenerate -m "descricao"
alembic upgrade head
```

## Estrutura

```
backend/
  src/
    domain/       # Entidades e interfaces
    application/  # DTOs, serviços, dependências
    infrastructure/ # Banco, repositórios, segurança
    routes/       # Endpoints FastAPI
frontend/
  src/
    components/   # Componentes reutilizáveis
    pages/        # Páginas da aplicação
    services/     # API e serviços
    hooks/        # Hooks customizados
    contexts/     # Contextos React
storage/          # Dados de runtime (banco, uploads)
```

## Regras de Arquitetura

- Frontend se comunica **exclusivamente** com o backend via REST API.
- **Sem acesso direto** a banco, Supabase SDK ou anon key no frontend.
- Supabase é usado **apenas como PostgreSQL** via connection string.
- **Sem `alert()` ou `confirm()`** — use componentes Modal.
- Locale brasileiro para datas, horas, números e moeda.
- IDs UUID em todas as entidades.
