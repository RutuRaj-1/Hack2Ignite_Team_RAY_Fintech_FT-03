# FINBRIDGE
### AI-Powered Inclusive Micro-Lending & Financial Intelligence Platform

> **Team RAY** — Ruturaj Vasudev Bhome (VIT Pune) & Akhilesh Lalitkumar Dhumal (GHRCEM Pune)  
> **Hackathon:** Hack2Ignite 2026  
> **Core Problem Statement:** FT-03 — Secure Micro-Lending for MSMEs with Alternative Credit Assessment

---

## What is FINBRIDGE?

FINBRIDGE breaks the credit barrier for India's 63 million MSMEs who are shut out of traditional lending because they have no CIBIL score. Instead of relying on credit bureaus, FINBRIDGE builds a creditworthiness profile from your **real financial activity** — UPI transactions, GST filings, seasonal cash flows, and utility regularity.

### Problem Statements Addressed

| Code | Problem | Our Solution |
|------|---------|-------------|
| **FT-03** (Core) | Secure Micro-Lending | Alternative credit scoring + loan lifecycle |
| FT-05 | MSME Expense Analytics | Transaction intelligence + cash flow dashboards |
| FT-02 | Fraud Detection | ML anomaly detection on transactions |
| FT-04 | Government Scheme Discovery | Automated MUDRA/PMEGP scheme matching |
| FT-01 | Financial Literacy | AI financial coach (Hindi + English) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 · TypeScript · Tailwind CSS v4 · Recharts |
| Backend | Python 3.14 · FastAPI · Pydantic v2 · SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 15+ · Supabase-compatible schema |
| ML | scikit-learn · pandas · numpy |
| Infrastructure | Supabase (planned) · Vercel (frontend) · Railway (backend) |

---

## Project Structure

```
finbridge/
├── frontend/          Next.js application
├── backend/           FastAPI modular monolith
│   └── app/
│       ├── main.py    FastAPI app factory
│       ├── core/      Config, database, security
│       ├── api/       REST endpoints (9 modules)
│       ├── models/    SQLAlchemy ORM models
│       ├── schemas/   Pydantic schemas
│       ├── services/  Business logic layer
│       └── ml/        ML pipeline (credit + fraud)
├── database/          PostgreSQL schema & migrations
├── data/              ML training data (raw/processed/models)
└── docs/              Architecture, API, and dev plan
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 15+ (or Supabase project)

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL
npm run dev                         # → http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env               # Set DATABASE_URL and APP_SECRET_KEY
uvicorn app.main:app --reload      # → http://localhost:8000
```

### Verify

```bash
# Health check
curl http://localhost:8000/health
# Expected: {"status":"ok","service":"finbridge-api"}

# API docs
open http://localhost:8000/docs
```
## Documentation

- [Architecture](docs/architecture.md) — System design, data flow, module map
- [API Overview](docs/api-overview.md) — All endpoints, request/response shapes
- [Development Plan](docs/development-plan.md) — 48-hour phased roadmap

---

