# FinanceFlow — SaaS Financeiro Premium

## Stack
- **Frontend:** Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Recharts
- **Backend:** Python 3.12, FastAPI, SQLAlchemy (async), Pydantic v2
- **Auth/DB:** Supabase, PostgreSQL + RLS
- **Deploy:** Vercel (frontend) + Railway (backend)
- **CI/CD:** GitHub Actions

---

## Setup rápido

### 1. Banco de dados — Supabase
```bash
# No Supabase SQL Editor, execute em ordem:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Preencha as variáveis no .env

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
# Preencha NEXT_PUBLIC_API_URL e NEXT_PUBLIC_SUPABASE_*

npm install
npm run dev
```

### 4. Docker (tudo junto)
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Preencha os .env files

docker-compose up --build
```

---

## Variáveis de ambiente necessárias

### Backend `.env`
| Variável | Descrição |
|---|---|
| `SECRET_KEY` | `openssl rand -hex 32` |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) |
| `DATABASE_URL` | `postgresql+asyncpg://...` |
| `ENCRYPTION_KEY` | Base64 de 32 bytes aleatórios |

### Frontend `.env.local`
| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API backend |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon |

---

## Deploy produção

### Backend → Railway
1. Conecte o repositório no Railway
2. Configure as variáveis de ambiente
3. Railway detecta o `Dockerfile` automaticamente

### Frontend → Vercel
1. Importe o projeto no Vercel
2. Configure `Root Directory: frontend`
3. Adicione as variáveis de ambiente

---

## GitHub Actions Secrets necessários
```
RAILWAY_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Arquitetura de segurança

- **Row Level Security (RLS)** em todas as tabelas — isolamento total entre usuários
- **JWT** com access token (30min) + refresh token (30 dias)
- **AES-256-GCM** para campos sensíveis
- **Rate limiting** por IP (60 req/min)
- **Security Headers** (HSTS, CSP, X-Frame-Options, etc.)
- **Soft delete** — dados nunca são apagados fisicamente
- **Audit logs** para todas as operações críticas
- **Nenhuma credencial hardcoded**

---

## Estrutura do projeto

```
pork/
├── backend/
│   ├── app/
│   │   ├── core/         # config, db, security, deps
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routes/       # FastAPI routers
│   │   ├── services/     # business logic
│   │   ├── repositories/ # data access
│   │   └── middlewares/  # security headers, timing
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── (auth)/       # login, register, forgot-password
│   │   └── (dashboard)/  # todas as páginas protegidas
│   ├── components/       # ui, dashboard, charts, layout
│   ├── hooks/            # data fetching hooks
│   ├── services/         # api client
│   └── lib/              # utils, formatters
└── supabase/migrations/  # SQL migrations + RLS
```