# FINBRIDGE
### AI-Powered Inclusive Micro-Lending & Financial Intelligence Platform

> **Team RAY** — Ruturaj Vasudev Bhome & Akhilesh Lalitkumar Dhumal  
> **Hackathon:** Hack2Ignite  

---

## 1. Project Overview
FINBRIDGE breaks the credit barrier for India's 63 million MSMEs who lack a CIBIL score. By building a creditworthiness profile from real financial exhaust (UPI transactions, cash flow volatility, expense discipline), FINBRIDGE replaces traditional collateral with mathematical trust. 

## 2. Problem Statement Mapping
Our architecture seamlessly integrates 5 problem statements into one unified core:
- **FT-03 (Core): Secure Micro-Lending.** The central engine that issues and assesses micro-loans using alternative credit scoring.
- **FT-05: Financial Analytics.** Ingests raw CSVs and normalizes them into structured cash flow dashboards to feed the credit engine.
- **FT-02: Fraud/Risk Signal.** Uses Isolation Forest ML to detect anomalous transactions, protecting the lender and lowering the borrower's Trust Score.
- **FT-04: Government Scheme Discovery.** Evaluates the MSME profile to automatically suggest MUDRA or PMEGP grants.
- **FT-01: Financial Literacy.** A contextual AI Coach that grounds its answers in the user's actual financial telemetry to explain EMIs, cash flow, and repayment burden.

## 3. Architecture
```text
Financial Data (Bank/CSV)
       ↓
FT-05 Analytics (Normalization & Categorization)
       ↓
FT-02 Risk (Anomaly Detection & Fraud Shield)
       ↓
FT-03 Alternative Credit (Trust Score & Affordability Math)
       ↓
Loan Assessment & Repayment Simulation
       ↓
(Supporting Layers: FT-04 Scheme Discovery & FT-01 Financial Coaching)
```

## 4. Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts
- **Backend:** Python 3.14, FastAPI, Pydantic, SQLAlchemy (Async)
- **Database:** SQLite (Dev) / PostgreSQL via asyncpg (Prod)
- **ML / Risk:** scikit-learn (Isolation Forest), Pandas, Numpy
- **Authentication:** Firebase Auth (Stateless JWTs)
- **AI Coach:** Local Ollama / Remote LLM Fallback (No LangChain bloat)

## 5. Folder Structure
```text
finbridge/
├── frontend/          React 18 + Vite + TypeScript application
├── backend/           FastAPI modular monolith
│   └── app/
│       ├── main.py    FastAPI app factory
│       ├── core/      Config, database, security
│       ├── api/       REST endpoints (v1 router)
│       ├── models/    SQLAlchemy ORM models
│       ├── schemas/   Pydantic validation schemas
│       ├── services/  Business logic (Credit, Coach, Transactions)
│       └── ml/        Risk rules & Isolation Forest Engine
├── docs/              Architecture, API docs, Demo scripts
└── data/              Sample CSVs
```

## 6. Local Setup
**Prerequisites:** Node.js 20+, Python 3.12+, Firebase Project (for Auth).

## 7. Environment Variables
**Frontend (`frontend/.env.local`):**
- `NEXT_PUBLIC_API_URL=http://localhost:8000`
- `NEXT_PUBLIC_FIREBASE_API_KEY=...`

**Backend (`backend/.env`):**
- `DATABASE_URL=sqlite+aiosqlite:///./finbridge.db`
- `LLM_PROVIDER=ollama` (or `gemini`)
- `GEMINI_API_KEY=your_key`

## 8. Database Setup
The backend runs zero-setup SQLite by default for development. 
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
pytest  # Automatically creates and tests the DB schema
```

## 9. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 10. Backend Setup
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```
Check health at `http://localhost:8000/health`.

## 11. API Overview
View the auto-generated Swagger UI at `http://localhost:8000/docs` or read the detailed Markdown export in [`docs/api.md`](docs/api.md).

## 12. Demo Credentials
If testing via Postman without the frontend, you can bypass Firebase by mocking the `verify_firebase_token` dependency or generating a test token in the Firebase console. In the UI, use any valid Google account to Sign In. 
*Demo Business:* "Shree Digital Solutions"

## 13. Demo Workflow
Please see [`docs/demo-script.md`](docs/demo-script.md) for the exact 12-step presentation flow covering registration, transaction upload, analytics, fraud detection, trust scoring, loan simulation, scheme matching, and AI coaching.

## 14. Limitations
- CSV ingestion assumes standard column names (Date, Description, Amount, Type). In production, this would integrate with the Account Aggregator (AA) framework.
- The Isolation Forest model is untrained and uses synthetic rules for the prototype. It requires real banking datasets to tune its anomaly thresholds.

## 15. Future Scope
- **Account Aggregator Integration:** Pull live bank statements securely via consent (Sahamati).
- **Dynamic Interest Pricing:** Connect the Trust Score directly to a live risk-pricing curve.
- **Multi-lingual AI Coach:** Expand FT-01 to support regional Indian languages via Bhashini API.
- **Auto-Debit NACH:** Integrate recurring loan EMI deductions directly from the borrower's bank account.
