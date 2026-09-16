# FINBRIDGE — System Architecture

> **Version:** 0.1.0 (Part 01 Foundation)  
> **Team:** RAY — Ruturaj Bhome (VIT Pune) & Akhilesh Dhumal (GHRCEM Pune)  
> **Hackathon:** Hack2Ignite 2026  
> **Core Problem:** FT-03 — Secure Micro-Lending Platform for MSMEs

---

## 1. Problem Statement Architecture

FINBRIDGE addresses five interconnected fintech problem statements:

| Layer | Problem | Focus |
|-------|---------|-------|
| **Core** | FT-03 | Secure micro-lending with alternative credit assessment |
| Intelligence | FT-05 | MSME expense analytics → financial data for credit |
| Intelligence | FT-02 | Fraud & risk detection → trust layer for lending |
| Discovery | FT-04 | Government scheme matching → accessible funding |
| Education | FT-01 | Financial literacy → coach for borrower success |

All intelligence layers feed into the FT-03 core:

```
FT-01 (Coach)        FT-02 (Fraud)       FT-04 (Schemes)      FT-05 (Analytics)
     │                    │                     │                     │
     └──────────────────────────────────────────────────────────────────┘
                                    │
                             FT-03 CORE LENDING ENGINE
                      (Credit Score → Loan Matching → Disbursement)
```

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│   Next.js 16 (App Router) + TypeScript + Tailwind CSS v4         │
│   Recharts for analytics visualisation                           │
│   Port: 3000                                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP REST / JSON
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                                │
│                                                                   │
│   FastAPI (Python 3.14) + Pydantic v2                            │
│   Versioned: /api/v1/                                            │
│   CORS: configured for localhost:3000                            │
│   Port: 8000                                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                               │
│                                                                   │
│   auth │ business │ transactions │ analytics │ fraud             │
│   credit │ loans │ schemes │ coach                               │
│                                                                   │
│   Each module = isolated service class + router + schema         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ORM LAYER                                  │
│                                                                   │
│   SQLAlchemy 2.0 (async)                                         │
│   Declarative Base (public schema — Supabase-compatible)         │
│   Models: User, Business, Transaction, Loan,                     │
│           CreditScore, Scheme, FraudFlag                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ asyncpg driver
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                              │
│                                                                   │
│   PostgreSQL 15+                                                  │
│   Schema: public (Supabase default)                              │
│   UUID primary keys (auth.users compatible)                      │
│   Row-Level Security ready (to be enabled in Supabase)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Module Boundaries

Each module is a self-contained vertical slice with its own:
- Router (`api/v1/endpoints/<module>.py`)
- Service (`services/<module>.py`)
- Models (`models/<module>.py`)
- Schemas (`schemas/<module>.py`)

### Module Map

```
backend/app/
├── api/v1/endpoints/
│   ├── health.py          GET /health
│   ├── auth.py            POST /auth/register, /auth/login, /auth/refresh
│   ├── business.py        CRUD /business/profile, POST /business/kyc
│   ├── transactions.py    POST /transactions, GET /transactions, POST /transactions/bulk
│   ├── analytics.py       GET /analytics/summary, /cashflow, /categories
│   ├── fraud.py           POST /fraud/scan, GET /fraud/risk-profile, /fraud/flags
│   ├── credit.py          POST /credit/score, GET /credit/score, /credit/history, /credit/factors
│   ├── loans.py           POST /loans/apply, GET /loans, /loans/{id}, /loans/{id}/schedule
│   ├── schemes.py         GET /schemes, /schemes/match, /schemes/{id}
│   └── coach.py           POST /coach/chat, GET /coach/tips, /coach/lessons
│
├── services/              Business logic (Part 02+)
├── models/                SQLAlchemy ORM models
├── schemas/               Pydantic request/response models
└── ml/                    ML pipeline (Part 03)
```

---

## 4. Data Flow: Loan Application (FT-03)

```
User submits loan application
        │
        ▼
POST /api/v1/loans/apply
        │
        ▼
LoanService.apply()
        │
        ├──► BusinessService.get_profile()   → validate KYC status
        │
        ├──► CreditService.get_score()       → fetch latest credit score
        │         │
        │         └──► MLPipeline.predict()  → scikit-learn model
        │                   │
        │                   └──► TransactionService.list_for_business()
        │                           → UPI/bank transaction features
        │
        ├──► FraudService.get_risk_profile() → check fraud flags
        │
        └──► LoanRepository.create()         → persist loan record
                    │
                    ▼
              PostgreSQL (public.loans)
```

---

## 5. Frontend Architecture

```
frontend/
├── app/
│   ├── layout.tsx          Root layout + metadata + fonts
│   ├── page.tsx            Landing page (Hero, Features, How it Works)
│   ├── globals.css         Design system (CSS custom properties + utility classes)
│   ├── error.tsx           Error boundary
│   └── not-found.tsx       404 page
├── lib/
│   └── api.ts             Typed API client (fetch wrapper)
└── components/             UI components (Part 02)
```

### Design System
- **Color palette:** Dark glassmorphism fintech theme (HSL-based CSS custom properties)
- **Typography:** Inter (UI) + JetBrains Mono (code)
- **Animations:** CSS keyframe animations — fadeInUp, float, shimmer, pulse-glow
- **Components:** .glass-card, .btn-primary, .badge, .status-dot

---

## 6. Supabase Migration Path

The current setup is designed to migrate to Supabase with minimal changes:

1. **Database URL** — change `DATABASE_URL` in `.env` to Supabase connection string
2. **Authentication** — replace JWT helpers with `supabase.auth` client
3. **Row Level Security** — enable RLS policies on all tables (skeleton in `database/init.sql`)
4. **Realtime** — add Supabase Realtime subscriptions for loan status updates
5. **Storage** — use Supabase Storage for KYC document uploads

---

## 7. Security Architecture

- **Transport:** HTTPS (enforced in production)
- **Authentication:** JWT (access + refresh tokens)
- **Authorization:** Role-based (borrower, lender, admin) — Part 02
- **Data isolation:** Supabase Row-Level Security — Part 02
- **Secret management:** All secrets via environment variables (Pydantic BaseSettings)
- **No secrets** hardcoded in any source file

---

## 8. Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | Next.js | 16.x |
| UI language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | 2.x |
| Icons | Lucide React | latest |
| Backend framework | FastAPI | 0.115.x |
| Runtime | Python | 3.14 |
| Data validation | Pydantic | 2.x |
| ORM | SQLAlchemy | 2.0.x (async) |
| DB driver | asyncpg | latest |
| Migrations | Alembic | latest |
| Database | PostgreSQL | 15+ |
| ML | scikit-learn + pandas + numpy | latest |
| Logging | structlog | latest |
