# FINBRIDGE — API Overview

> **Base URL:** `http://localhost:8000`  
> **API Version:** v1 — all endpoints under `/api/v1/`  
> **Docs:** `http://localhost:8000/docs` (Swagger UI)  
> **ReDoc:** `http://localhost:8000/redoc`

---

## Design Principles

1. **Versioned** — All endpoints under `/api/v1/`. Breaking changes increment the version.
2. **Consistent envelope** — All responses use the standard shape:
   ```json
   {
     "success": true | false,
     "message": "human-readable status",
     "data": { ... } | null,
     "errors": null | [{ "field": "...", "message": "..." }]
   }
   ```
3. **Authentication** — JWT Bearer tokens. Include `Authorization: Bearer <token>` header.
4. **Content-Type** — `application/json` for all requests.
5. **HTTP Status Codes** — Standard: 200, 201, 400, 401, 403, 404, 422, 500.

---

## Endpoints

### Health

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| GET | `/health` | None | ✅ Live | Liveness probe |
| GET | `/api/v1/health` | None | ✅ Live | Versioned health check |

**Response:**
```json
{
  "status": "ok",
  "service": "finbridge-api"
}
```

---

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/v1/auth/register` | None | 🔜 Part 02 | Register new user |
| POST | `/api/v1/auth/login` | None | 🔜 Part 02 | Login + JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh token | 🔜 Part 02 | Refresh access token |
| POST | `/api/v1/auth/logout` | Bearer | 🔜 Part 02 | Invalidate session |

---

### Business (`/api/v1/business`) — FT-03 Core

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/v1/business/profile` | Bearer | 🔜 Part 02 | Create MSME profile |
| GET | `/api/v1/business/profile/{id}` | Bearer | 🔜 Part 02 | Get business profile |
| PUT | `/api/v1/business/profile/{id}` | Bearer | 🔜 Part 02 | Update business profile |
| POST | `/api/v1/business/kyc/{id}` | Bearer | 🔜 Part 02 | Submit KYC |

---

### Transactions (`/api/v1/transactions`) — FT-05

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/v1/transactions/` | Bearer | 🔜 Part 02 | Create transaction |
| GET | `/api/v1/transactions/` | Bearer | 🔜 Part 02 | List transactions |
| POST | `/api/v1/transactions/bulk` | Bearer | 🔜 Part 02 | Bulk CSV/JSON upload |

---

### Analytics (`/api/v1/analytics`) — FT-05

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| GET | `/api/v1/analytics/summary/{id}` | Bearer | 🔜 Part 02 | Financial health summary |
| GET | `/api/v1/analytics/cashflow/{id}` | Bearer | 🔜 Part 02 | Cash flow trends |
| GET | `/api/v1/analytics/categories/{id}` | Bearer | 🔜 Part 02 | Expense breakdown |

---

### Fraud Detection (`/api/v1/fraud`) — FT-02

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/v1/fraud/scan/{tx_id}` | Bearer | 🔜 Part 03 | Scan transaction |
| GET | `/api/v1/fraud/risk-profile/{id}` | Bearer | 🔜 Part 03 | Get risk profile |
| GET | `/api/v1/fraud/flags/{id}` | Bearer | 🔜 Part 03 | List risk flags |

---

### Credit Scoring (`/api/v1/credit`) — FT-03 Core

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/v1/credit/score/{id}` | Bearer | 🔜 Part 03 | Generate credit score |
| GET | `/api/v1/credit/score/{id}` | Bearer | 🔜 Part 03 | Get latest score |
| GET | `/api/v1/credit/history/{id}` | Bearer | 🔜 Part 03 | Score history |
| GET | `/api/v1/credit/factors/{id}` | Bearer | 🔜 Part 03 | Explainability factors |

---

### Loans (`/api/v1/loans`) — FT-03 Core

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/v1/loans/apply` | Bearer | 🔜 Part 02 | Apply for loan |
| GET | `/api/v1/loans/` | Bearer | 🔜 Part 02 | List loans |
| GET | `/api/v1/loans/{id}` | Bearer | 🔜 Part 02 | Get loan detail |
| POST | `/api/v1/loans/{id}/repay` | Bearer | 🔜 Part 02 | Record repayment |
| GET | `/api/v1/loans/{id}/schedule` | Bearer | 🔜 Part 02 | Repayment schedule |

---

### Government Schemes (`/api/v1/schemes`) — FT-04

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| GET | `/api/v1/schemes/` | None | 🔜 Part 02 | List all schemes |
| GET | `/api/v1/schemes/match/{id}` | Bearer | 🔜 Part 02 | Match schemes to MSME |
| GET | `/api/v1/schemes/{scheme_id}` | None | 🔜 Part 02 | Get scheme details |
| POST | `/api/v1/schemes/{sid}/apply/{bid}` | Bearer | 🔜 Part 02 | Initiate application |

---

### AI Coach (`/api/v1/coach`) — FT-01

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/v1/coach/chat` | Bearer | 🔜 Part 03 | Chat with AI coach |
| GET | `/api/v1/coach/tips/{id}` | Bearer | 🔜 Part 03 | Personalized tips |
| GET | `/api/v1/coach/lessons` | None | 🔜 Part 03 | List lesson modules |
| GET | `/api/v1/coach/lessons/{id}` | None | 🔜 Part 03 | Get lesson detail |

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request — validation failed |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not found |
| 422 | Unprocessable entity — Pydantic validation error |
| 500 | Internal server error |
