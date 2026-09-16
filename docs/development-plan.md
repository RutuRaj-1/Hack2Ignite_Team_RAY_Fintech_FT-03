# FINBRIDGE — Development Plan

> **Hackathon:** Hack2Ignite 2026 (48 hours)  
> **Team:** RAY — Ruturaj Bhome & Akhilesh Dhumal  
> **Core:** FT-03 Secure Micro-Lending with Alternative Credit Assessment

---

## Timeline Overview

```
Hour 00–06   Part 01   Foundation       ← COMPLETE ✅
Hour 06–18   Part 02   Core Features
Hour 18–30   Part 03   ML + AI Layers
Hour 30–40   Part 04   Integration + UI Polish
Hour 40–48   Part 05   Testing + Demo Prep
```

---

## ✅ Part 01: Foundation (Hours 0–6) — COMPLETE

### Completed
- [x] Next.js 16 frontend with TypeScript + Tailwind CSS v4
- [x] FastAPI backend with modular monolith structure
- [x] All 9 module boundaries (stubs): auth, business, transactions, analytics, fraud, credit, loans, schemes, coach
- [x] Pydantic BaseSettings configuration
- [x] SQLAlchemy async engine (Supabase-compatible)
- [x] PostgreSQL schema (`database/init.sql`)
- [x] GET /health endpoint
- [x] FINBRIDGE landing page (hero, features, how-it-works)
- [x] Dark glassmorphism design system
- [x] Error boundaries and 404 pages
- [x] Environment variable templates (.env.example)
- [x] Architecture + API documentation

---

## 🔄 Part 02: Core Features (Hours 6–18)

### Backend
- [ ] User registration and JWT authentication
- [ ] Business profile CRUD + KYC document upload
- [ ] Transaction ingestion API (single + bulk CSV)
- [ ] Basic analytics: monthly summary, category breakdown
- [ ] Loan application flow (create, list, detail)
- [ ] Repayment schedule calculator
- [ ] Government schemes database seed (10+ MUDRA/PMEGP schemes)
- [ ] Scheme matching algorithm (rule-based, pre-ML)
- [ ] Alembic migration setup

### Frontend
- [ ] Authentication pages (login, register)
- [ ] Dashboard layout with sidebar navigation
- [ ] Business profile form + KYC wizard
- [ ] Transaction list with filters and pagination
- [ ] Recharts: cashflow line chart, expense pie chart
- [ ] Loan application form
- [ ] Government schemes discovery page

---

## 🤖 Part 03: ML + AI Layers (Hours 18–30)

### Credit Scoring (FT-03)
- [ ] Feature engineering pipeline (pandas)
  - UPI transaction velocity (30/60/90 day)
  - GST filing consistency score
  - Seasonal income pattern detection
  - Utility bill regularity
  - Debt-to-income ratio
- [ ] Train scikit-learn model (Random Forest / Gradient Boosting)
- [ ] SHAP explainability for score factors
- [ ] Credit score API endpoint (live inference)

### Fraud Detection (FT-02)
- [ ] Anomaly detection (Isolation Forest)
- [ ] Rule-based red flags (velocity, round amounts, unusual hours)
- [ ] Real-time transaction scanning
- [ ] Risk profile aggregation

### AI Financial Coach (FT-01)
- [ ] LLM integration (Gemini / OpenAI API)
- [ ] Prompt engineering for financial literacy
- [ ] Hindi + English support
- [ ] Personalized tips from business profile

---

## 🎨 Part 04: Integration + Polish (Hours 30–40)

### Integration
- [ ] Connect all frontend pages to live API
- [ ] End-to-end loan application flow
- [ ] Real-time credit score display
- [ ] Fraud flag notifications

### UI Polish
- [ ] Recharts dashboard with real data
- [ ] Credit score gauge visualization
- [ ] Loan status timeline
- [ ] Scheme application tracker
- [ ] Mobile responsiveness

---

## 🧪 Part 05: Testing + Demo Prep (Hours 40–48)

- [ ] Seed demo data (1 MSME, transactions, loan application)
- [ ] End-to-end test: register → KYC → score → loan → scheme
- [ ] API smoke tests (pytest)
- [ ] Fix critical bugs
- [ ] Record demo video
- [ ] Final slide deck
- [ ] Deploy to Railway / Vercel (optional)

---

## Module Priority (FT-03 First)

```
HIGH PRIORITY (Part 02)
  ├── auth              → enables everything else
  ├── business          → core FT-03 entity
  ├── loans             → core FT-03 deliverable
  └── transactions      → credit scoring data source

MEDIUM PRIORITY (Part 02–03)
  ├── analytics         → FT-05, feeds credit
  ├── credit            → FT-03 ML layer
  └── schemes           → FT-04 quick win

LATER (Part 03)
  ├── fraud             → FT-02 ML layer
  └── coach             → FT-01 LLM layer
```

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| No PostgreSQL locally | Use Supabase free tier (direct DB URL) |
| ML model not ready | Ship rule-based credit score first, replace with ML model |
| Python 3.14 ML compatibility | pandas/numpy/scikit-learn latest versions support 3.14 |
| LLM cost | Use Gemini Flash (free tier) for AI coach |
| Time constraint | Core FT-03 flow is P0; FT-01/FT-02 are P2 |

---

## Environment Setup

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in DATABASE_URL
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Fill in NEXT_PUBLIC_API_URL
npm run dev
```

### Database
```bash
# PostgreSQL
psql -U postgres -d finbridge -f database/init.sql

# Or paste contents into Supabase SQL Editor
```
