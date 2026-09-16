# PRD — FinBridge
## AI-Powered Inclusive Micro-Lending & Financial Intelligence Platform

**Document Type:** Product Requirements Document (PRD)  
**Version:** 1.0  
**Status:** Hackathon Build Specification  
**Prepared For:** Hack 2 Ignite 2026-27 — FinTech Domain  
**Primary Problem Statement:** FT-03  
**Supporting Problem Statements:** FT-01, FT-02, FT-04, FT-05  
**Target Build Window:** 48-hour online qualifier prototype  
**Primary Product Goal:** Build one coherent, demonstrable fintech product centered on alternative-credit micro-lending rather than five disconnected applications.

---

# 1. Executive Summary

FinBridge is an AI-powered financial intelligence and inclusive micro-lending platform for small businesses and self-employed individuals who may have limited traditional credit history.

The core of FinBridge is **FT-03: secure micro-lending with alternative credit assessment mechanisms**. The remaining four FinTech problem statements are integrated as supporting layers:

- **FT-05 — MSME expense tracking and analytics:** provides the financial behavior and cash-flow intelligence used by the lending engine.
- **FT-02 — AI-powered fraud detection:** produces transaction-risk signals that improve lending risk assessment.
- **FT-04 — government financial schemes/subsidies discovery:** identifies potentially relevant financing/support opportunities alongside the loan journey.
- **FT-01 — financial literacy:** explains financial concepts, surfaces contextual insights, and provides a financial coaching layer.

The product's central journey is:

> **Financial Data → Financial Analytics → Fraud/Risk Analysis → Alternative Credit Assessment → Loan Assessment → Repayment Simulation → Financial Guidance / Scheme Discovery**

The product is intentionally designed as a **modular monolith** for the 48-hour hackathon. The MVP emphasizes an end-to-end working prototype, explainability, deterministic financial calculations, transparent scoring, synthetic/demo data, and a clean commit history.

---

# 2. Hackathon Context

Hack 2 Ignite 2026-27 is organized by GH Raisoni International Skill Tech University. The current Unstop listing states that the online qualifier is a **48-hour** build-and-submit round, that prototype development and presentation are required, and that GitHub history will be checked. The listing states that the Top 30 teams are shortlisted for an on-campus final round and that final evaluation considers innovation, technical implementation, presentation, feasibility, and impact. It also states that inter-college teams are allowed. [Source: Unstop Hack 2 Ignite listing, accessed 16 Sep 2026.]

Because GitHub history is checked, development must be incremental and traceable. The implementation plan in this PRD therefore uses ten major development parts with a meaningful commit after each part.

---

# 3. Problem Statements

## 3.1 FT-03 — Core

**Create a secure micro-lending platform for small businesses and self-employed individuals with alternative credit assessment mechanisms.**

This is the primary product problem.

FinBridge should address the question:

> How can a small business or self-employed person with limited formal credit information demonstrate repayment capacity using explainable evidence from actual financial behavior?

## 3.2 FT-05 — Supporting Intelligence Layer

**Develop a digital expense tracking and analytics platform for MSMEs.**

FinBridge uses transaction and expense analytics to understand:

- revenue
- expenses
- net cash flow
- expense ratio
- revenue consistency
- transaction behavior
- cash-flow volatility

## 3.3 FT-02 — Supporting Risk Layer

**Design an AI-powered fraud detection system for identifying suspicious transactions in real time.**

FinBridge uses a hybrid approach:

- deterministic fraud rules
- Isolation Forest anomaly detection

The output is a risk signal, not an automatic rejection.

## 3.4 FT-04 — Supporting Opportunity Layer

**Build a solution to simplify access to government financial schemes and subsidies for citizens.**

FinBridge uses a curated, source-linked scheme database and rule-based profile matching to surface potentially relevant schemes.

## 3.5 FT-01 — Supporting Education Layer

**Develop a financial literacy platform that helps students and first-time earners manage savings, investments, and budgeting effectively.**

For this product, FT-01 is integrated as contextual financial education and coaching, with emphasis on:

- cash flow
- EMI
- interest
- repayment burden
- expense management
- financial discipline

---

# 4. Product Vision

## Vision Statement

> **Make financial behavior understandable and useful for underserved businesses by turning everyday financial data into explainable financial intelligence, safer borrowing decisions, and actionable financial guidance.**

## Product Positioning

FinBridge is not five applications connected together. It is one **Financial Intelligence + Inclusive Lending Platform**.

The central architecture is:

```text
                         FINBRIDGE
             AI-POWERED INCLUSIVE FINANCE
                              │
                              ▼
                    ┌──────────────────┐
                    │ User / Business  │
                    └────────┬─────────┘
                             │
                             ▼
                    Financial Data Layer
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
     FT-05 Analytics    FT-02 Fraud       FT-01 Coach
     Revenue/Expense    Risk Signals      Financial Literacy
           │                 │                 │
           └─────────────────┼─────────────────┘
                             ▼
                  Alternative Credit Engine
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        Financial Trust Score       Repayment Capacity
                │                         │
                └────────────┬────────────┘
                             ▼
                       FT-03 LENDING
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
            Loan Offer              Loan Simulator
                 │                       │
                 └───────────┬───────────┘
                             ▼
                       FT-04 SCHEMES
                             │
                             ▼
                Personalized Financial Plan
```

---

# 5. Goals and Objectives

## 5.1 Primary Goals

1. Deliver an end-to-end FT-03 alternative-credit lending prototype.
2. Integrate meaningful portions of FT-01, FT-02, FT-04 and FT-05.
3. Demonstrate a transparent and explainable alternative financial profile.
4. Use real financial calculations rather than fabricated AI outputs.
5. Build a working product that can be demonstrated within the 48-hour qualifier.
6. Maintain a clean, traceable GitHub history.
7. Keep the architecture extensible without over-engineering the hackathon MVP.

## 5.2 Secondary Goals

- Demonstrate responsible borrowing through loan simulation.
- Provide clear reasons behind risk and loan recommendations.
- Surface potential government scheme matches with source and verification status.
- Give users actionable financial education tied to their data.

---

# 6. Non-Goals for the 48-Hour Prototype

The following are explicitly outside the MVP scope:

- actual loan disbursement
- real bank credential storage
- production KYC infrastructure
- credit-bureau integration
- live banking integrations unless already available and low-risk to implement
- production-grade lending compliance infrastructure
- full mobile application
- blockchain implementation without a real business need
- deep-learning fraud architecture
- large-scale government-scheme catalog
- guaranteed loan approval
- real-world regulated credit decisions

The prototype must not present itself as a bank, licensed lender, credit bureau, or guaranteed approval system.

---

# 7. Target Users

## Primary Persona — Small Business Owner / Self-Employed Individual

Examples:

- kirana/shop owner
- freelancer
- tailor
- small manufacturer
- local service provider
- retailer
- home-based entrepreneur

## Demo Persona

**Business:** Shree Digital Solutions  
**Monthly Revenue:** ₹1.75L  
**Monthly Expenses:** ₹1.12L  
**Existing EMI:** ₹20,000  
**Requested Loan:** ₹75,000

The application must be capable of showing the complete user journey using this synthetic/demo profile.

---

# 8. Core User Problems

## Problem A — Limited Traditional Credit Evidence

A small business may have financial activity but limited formal credit depth.

FinBridge addresses this by calculating an explainable prototype financial-behavior score.

## Problem B — Poor Visibility Into Business Cash Flow

Users may know revenue and expense totals but not understand the relationship between them.

FinBridge turns transaction history into cash-flow and business-health insights.

## Problem C — Transaction Risk

Suspicious transactions can distort financial analysis or increase risk.

FinBridge identifies transaction anomalies and exposes clear reasons.

## Problem D — Financing Opportunity Blind Spots

A user may be unaware of relevant government support programs.

FinBridge surfaces potentially relevant schemes with verification status.

## Problem E — Borrowing Without Understanding Consequences

Users may focus on the requested amount and not the repayment impact.

FinBridge provides EMI and cash-flow simulations and contextual education.

---

# 9. Product Principles

1. **FT-03 first:** every major component should contribute to the lending journey.
2. **Explainability over black box behavior.**
3. **Backend is the financial source of truth.**
4. **AI explains; deterministic engines calculate.**
5. **No sensitive personal attributes in prototype credit scoring.**
6. **Fraud signals inform lending; they do not automatically reject users.**
7. **Government scheme information must be source-linked and verifiable.**
8. **Use synthetic/demo data for the hackathon.**
9. **Build a coherent prototype, not five fragmented products.**
10. **Every development stage must be runnable and commit-ready.**

---

# 10. End-to-End User Journey

```text
Register
   ↓
Create Business Profile
   ↓
Upload Transaction CSV
   ↓
Transaction Validation + Categorization
   ↓
Financial Analytics
   ↓
Fraud / Risk Analysis
   ↓
Financial Trust Score
   ↓
Loan Application
   ↓
Loan Assessment
   ↓
Loan Simulator
   ↓
Prototype Loan Recommendation
   ↓
Government Scheme Matching
   ↓
Financial Coach / Insights
```

The end-to-end journey is more important than the number of isolated features.

---

# 11. Functional Requirements

# 11.1 Authentication

### Requirements

- user registration
- login
- JWT authentication
- secure password hashing
- authenticated session handling
- current-user endpoint
- logout/token invalidation strategy as applicable to the implementation

### APIs

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Acceptance Criteria

- duplicate email is rejected
- invalid password is rejected
- protected endpoints require authentication
- a user cannot access another user's business data

---

# 11.2 Business Profile

### Fields

- business name
- business type
- location
- business age
- annual turnover

### APIs

```text
POST /business/profile
GET  /business/profile
PUT  /business/profile
```

### Acceptance Criteria

- profile is linked to authenticated user
- profile cannot be accessed by another user
- validation is applied to all inputs

---

# 11.3 FT-05 Transaction Ingestion

### CSV Schema

```text
Date
Description
Amount
Type
Merchant
```

### Processing Requirements

- file validation
- required-column validation
- type normalization
- date normalization
- numeric amount validation
- malformed-row handling
- duplicate protection where practical
- transaction categorization

### Categories

- Revenue
- Inventory
- Rent
- Utilities
- Salary
- Marketing
- Transportation
- Loan Payment
- Miscellaneous

### API

```text
POST /transactions/upload
GET  /transactions
```

---

# 11.4 FT-05 Financial Analytics

### Metrics

- monthly revenue
- monthly expenses
- net cash flow
- expense ratio
- average transaction value
- revenue consistency
- cash-flow volatility
- transaction frequency
- top expense categories
- monthly revenue trend
- monthly expense trend
- monthly cash-flow trend

### APIs

```text
GET /analytics/summary
GET /analytics/cashflow
GET /analytics/expenses
GET /analytics/revenue-trend
```

### Source of Truth

All financial metrics must be calculated by backend services.

The frontend must only display backend results.

---

# 11.5 FT-02 Fraud Detection

## Architecture

```text
Transaction
    ↓
Feature Extraction
    ↓
┌────────────────────┐
│ Rule Engine        │
│        +           │
│ Isolation Forest   │
└─────────┬──────────┘
          ↓
Risk Score
          ↓
LOW / MEDIUM / HIGH
```

## Detection Rules

1. unusually large transaction
2. transaction at unusual hour
3. abnormal transaction frequency
4. new beneficiary/merchant plus large amount
5. sudden deviation from historical behavior
6. rapid movement of recently received funds

## Output

```text
risk_score: 0-100
risk_level: LOW | MEDIUM | HIGH
reasons: list[str]
model_type: rule | isolation_forest | hybrid
```

### APIs

```text
POST /fraud/analyze
GET  /fraud/alerts
GET  /fraud/summary   (optional)
```

### Important Product Rule

Fraud detection is a risk signal. It must not automatically reject a borrower.

---

# 11.6 FT-03 Alternative Credit Assessment

## Financial Trust Score

**Name:** FinBridge Financial Trust Score  
**Range:** 0–100

This is a prototype financial-behavior score and is not a real credit-bureau score.

## Suggested Weighting

| Component | Weight |
|---|---:|
| Financial Stability | 25% |
| Cash Flow Health | 20% |
| Revenue Consistency | 15% |
| Expense Discipline | 10% |
| Repayment Capacity | 15% |
| Transaction Behaviour | 10% |
| Fraud/Risk Signals | 5% |
| **Total** | **100%** |

## Candidate Features

```text
avg_monthly_revenue
revenue_std
avg_monthly_expense
expense_ratio
net_cash_flow
cash_flow_volatility
transaction_frequency
avg_transaction_value
revenue_consistency
fraud_alert_rate
repayment_capacity
```

## Fairness Boundary

The prototype score must not use sensitive attributes such as:

- religion
- caste
- political affiliation
- health information
- other sensitive personal characteristics

The model should use financial and business behavior.

## Explainability Requirements

For every score, show:

### Positive Factors

Examples:

- stable revenue
- positive cash flow
- low anomaly rate
- healthy repayment capacity

### Negative Factors

Examples:

- increased inventory spending
- recent revenue decline
- high expense ratio
- volatile cash flow

## APIs

```text
POST /credit/assess
GET  /credit/profile
```

---

# 11.7 FT-03 Loan Application and Assessment

## Input

- requested amount
- tenure in months
- purpose

## Output

- estimated EMI
- estimated interest
- repayment burden
- current monthly surplus
- post-loan projected surplus
- recommended loan range
- prototype risk level
- supporting factors
- caution factors

## Language Requirements

Do not return a production-like “Approved” status.

Use:

> Prototype Recommendation

Example:

```text
Recommended Loan Range: ₹50,000–₹75,000

Supporting Factors:
+ Stable revenue
+ Positive cash flow
+ Low fraud risk
+ Sustainable repayment capacity

Cautions:
- Recent inventory expenses increased
- Higher requested amount increases repayment burden
```

## APIs

```text
POST /loans/apply
POST /loans/assess
GET  /loans/{id}
POST /loans/{id}/simulate
```

---

# 11.8 Loan Simulator

Users should be able to change:

- loan amount
- tenure

The interface must dynamically update:

- EMI
- interest
- repayment burden
- projected post-loan cash flow

### EMI Formula

For a monthly interest rate `r`, principal `P`, and number of months `n`:

```text
EMI = P × r × (1+r)^n / ((1+r)^n - 1)
```

The implementation must handle zero-interest cases separately.

---

# 11.9 FT-04 Government Scheme Engine

## Data Model

```text
name
description
business_type
minimum_turnover
maximum_turnover
eligible_locations
eligibility_rules
source_url
verification_status
```

## Matching Logic

Match the business profile against available non-sensitive criteria.

Output:

- match percentage
- matched conditions
- conditions requiring verification
- source URL
- verification status

### Required Disclaimer

> Informational / Prototype Match — verify official eligibility before applying.

## APIs

```text
GET /schemes
GET /schemes/matches
```

## Data Integrity Rule

Do not fabricate government schemes or eligibility rules. Use verified official information where real schemes are included. Synthetic records must be clearly labeled as demo data.

---

# 11.10 FT-01 Financial Literacy and Coaching

FT-01 should be contextual rather than a separate portal.

## Educational Topics

- cash flow
- EMI
- interest
- repayment burden
- revenue consistency
- expense management
- transaction risk

## Contextual Insight Examples

If expense ratio is high:

> Your expenses currently consume a large portion of revenue.

If cash flow is volatile:

> Your monthly cash flow varies significantly. Maintaining a cash reserve may reduce repayment pressure.

## Financial Coach

The user may ask:

- Can I afford a ₹50,000 loan?
- Why is my Trust Score low?
- Why was this transaction flagged?
- How can I improve my cash flow?
- What is EMI?
- What is repayment burden?

The backend must calculate the underlying financial numbers first. The LLM may explain those values but must not invent them.

---

# 12. AI Requirements

## AI Role

AI is an explanation and coaching layer.

It is not the source of truth for numerical financial calculations and must not directly decide loan outcomes.

### Correct Flow

```text
Financial Data
      ↓
Deterministic Calculations
      ↓
Credit / Fraud / Loan Engines
      ↓
Structured JSON
      ↓
LLM
      ↓
Human-Readable Explanation
```

### Incorrect Flow

```text
User
 ↓
LLM
 ↓
Loan Approval
```

## AI Service Abstraction

Create:

```text
ai_service.py
```

Methods:

```text
generate_financial_explanation()
explain_fraud_alert()
explain_scheme()
financial_coach()
```

## Fallback Behavior

If an LLM API key is missing, the application should still work using deterministic fallback messages/templates.

---

# 13. System Architecture

## 13.1 High-Level Architecture

```text
                 ┌─────────────────────────────┐
                 │          FRONTEND           │
                 │ Next.js / React / TypeScript│
                 │ Tailwind / Recharts         │
                 └──────────────┬──────────────┘
                                │
                         REST / JSON API
                                │
                 ┌──────────────▼──────────────┐
                 │          BACKEND            │
                 │ FastAPI + Pydantic         │
                 │ Auth + API + Services      │
                 └──────────────┬──────────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
┌───────────────┐       ┌────────────────┐      ┌────────────────┐
│ Transaction   │       │ Credit Engine  │      │ Scheme Engine  │
│ Analytics     │       │ FT-03          │      │ FT-04          │
│ FT-05         │       │                │      │                │
└───────┬───────┘       └───────┬────────┘      └────────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐       ┌────────────────┐
│ Fraud Engine  │       │ Loan Engine    │
│ FT-02         │       │ EMI / Offers   │
└───────────────┘       └────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│          PostgreSQL / Supabase               │
└─────────────────────────────────────────────┘

                 ┌─────────────────────────────┐
                 │        AI Service Layer     │
                 │ LLM + Context + Fallback   │
                 └─────────────────────────────┘
```

## 13.2 Architectural Style

**Modular monolith** for the hackathon.

Reason:

- faster development
- simpler deployment
- easier local debugging
- shared transaction/financial context
- clear boundaries for later extraction into services

---

# 14. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy

## Database

- PostgreSQL
- Supabase-compatible design

## ML/Data

- Pandas
- NumPy
- Scikit-learn
- Isolation Forest

## AI

- pluggable LLM provider
- environment-based configuration
- deterministic fallback

## Deployment Target

- Frontend: Vercel
- Backend: Render / Railway / Fly.io or equivalent
- Database: Supabase/PostgreSQL

---

# 15. Backend Module Structure

```text
backend/
  app/
    main.py
    core/
      config.py
      security.py
      dependencies.py
    models/
    schemas/
    api/
      auth.py
      business.py
      transactions.py
      analytics.py
      fraud.py
      credit.py
      loans.py
      schemes.py
      coach.py
    services/
      transaction_service.py
      analytics_service.py
      fraud_service.py
      credit_service.py
      loan_service.py
      scheme_service.py
      ai_service.py
    ml/
      fraud_detector.py
      credit_scoring.py
      feature_engineering.py
    utils/
```

---

# 16. Frontend Structure

```text
frontend/
  app/
    login/
    register/
    onboarding/
    dashboard/
    transactions/
    analytics/
    fraud-alerts/
    credit-profile/
    loan/
    schemes/
    financial-coach/
  components/
    MetricCard
    RiskBadge
    TrustScoreCard
    TransactionTable
    ChartCard
    FraudAlertCard
    LoanRecommendationCard
    SchemeCard
    InsightCard
    CoachMessage
  lib/
  hooks/
  types/
```

---

# 17. Database Schema

## users

```text
id
name
email
password_hash
created_at
```

## businesses

```text
id
user_id
business_name
business_type
location
business_age
annual_turnover
created_at
```

## transactions

```text
id
business_id
transaction_date
amount
transaction_type
category
merchant
description
timestamp
created_at
```

## fraud_alerts

```text
id
transaction_id
risk_score
risk_level
detected_reasons
model_type
status
created_at
```

## credit_profiles

```text
id
business_id
cash_flow_score
stability_score
revenue_consistency_score
expense_discipline_score
repayment_capacity_score
transaction_behavior_score
fraud_risk_score
trust_score
explanation
created_at
```

## loan_applications

```text
id
business_id
requested_amount
tenure_months
purpose
status
created_at
```

## loan_offers

```text
id
loan_application_id
recommended_min_amount
recommended_max_amount
estimated_emi
estimated_interest
risk_level
explanation
created_at
```

## repayments

```text
id
loan_offer_id
due_date
amount
status
paid_at
```

## government_schemes

```text
id
name
description
target_business_types
minimum_turnover
maximum_turnover
eligible_locations
eligibility_rules
source_url
verification_status
```

## scheme_matches

```text
id
business_id
scheme_id
match_percentage
matched_conditions
unmet_conditions
created_at
```

---

# 18. API Contract

## Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

## Business

```text
POST /business/profile
GET  /business/profile
PUT  /business/profile
```

## Transactions

```text
POST /transactions/upload
GET  /transactions
```

## Analytics

```text
GET /analytics/summary
GET /analytics/cashflow
GET /analytics/expenses
GET /analytics/revenue-trend
```

## Fraud

```text
POST /fraud/analyze
GET  /fraud/alerts
GET  /fraud/summary
```

## Credit

```text
POST /credit/assess
GET  /credit/profile
```

## Loans

```text
POST /loans/apply
POST /loans/assess
GET  /loans/{id}
POST /loans/{id}/simulate
```

## Schemes

```text
GET /schemes
GET /schemes/matches
```

## AI Coach

```text
POST /coach
```

## System

```text
GET /health
```

---

# 19. Security Requirements

The MVP must include:

- JWT authentication
- password hashing
- Pydantic request validation
- authorization checks
- business-level access control
- environment variables for secrets
- CORS configuration
- ORM-based database access to mitigate injection risk
- validation of uploaded files
- safe exception handling
- basic rate limiting if practical
- audit logging for sensitive actions where practical

## Data Boundary

Do not store real bank credentials.

Use synthetic/demo financial data for the hackathon.

Do not expose API keys in frontend code or source control.

---

# 20. UX Requirements

The interface should feel like a modern fintech product rather than a generic admin dashboard.

## Dashboard Top Cards

```text
Revenue
Expenses
Net Cash Flow
Financial Trust Score
Fraud Risk
Prototype Loan Range
```

## Charts

- Revenue Trend
- Expense Breakdown
- Cash Flow Trend

## Supporting Sections

- Fraud Alerts
- Loan Recommendation
- Scheme Matches
- Financial Insights

## UX Questions the dashboard must answer quickly

1. How financially healthy is my business?
2. What is my Financial Trust Score?
3. Are there suspicious transactions?
4. How much could I potentially borrow?
5. Why did the system recommend this range?
6. What schemes might be relevant?
7. What should I improve?

---

# 21. Demo Dataset

## Business

Shree Digital Solutions

## Example Financial Context

```text
Monthly Revenue:      ₹1.75L
Monthly Expenses:     ₹1.12L
Existing EMI:         ₹20,000
Requested Loan:       ₹75,000
```

## Dataset Size

Approximately 200–300 synthetic transactions covering several months.

## Transaction Types

- customer payments
- supplier payments
- rent
- electricity
- salary
- transportation
- marketing
- inventory
- loan payments
- normal transactions
- several intentional anomaly cases

## Dataset Requirement

The dataset must be internally consistent and must generate meaningful:

- revenue
- expenses
- cash flow
- fraud alerts
- Trust Score
- prototype loan recommendation

---

# 22. Non-Functional Requirements

## Performance

For hackathon-scale data, API response times should generally remain fast enough for interactive dashboard use.

## Reliability

The system should fail gracefully if:

- LLM API is unavailable
- uploaded CSV contains malformed rows
- no fraud alerts exist
- no scheme matches exist
- financial history is insufficient

## Maintainability

- modular services
- typed interfaces
- clear naming
- reusable UI components
- centralized calculations
- minimal duplication

## Observability

At minimum:

- structured application logs
- backend error logs
- API error responses
- basic health endpoint

---

# 23. Testing Requirements

## Unit Tests

Test:

- CSV validation
- category assignment
- revenue calculation
- expense calculation
- cash flow
- expense ratio
- fraud rules
- fraud scoring
- Trust Score calculation
- EMI
- loan recommendation
- scheme matching

## Edge Cases

- zero revenue
- zero expenses
- negative cash flow
- empty CSV
- invalid CSV
- duplicate transactions
- extremely large transaction
- no fraud alerts
- excessive fraud alerts
- missing business profile
- unauthenticated API requests
- invalid loan amount
- invalid tenure
- missing LLM API key

## Example Financial Test

Given:

```text
Revenue = ₹175,000
Expenses = ₹112,000
Existing EMI = ₹20,000
```

The basic net operating cash-flow calculation before any additional adjustments should identify:

```text
₹175,000 - ₹112,000 = ₹63,000
```

Loan and repayment capacity calculations must document exactly which components are subsequently deducted or adjusted.

---

# 24. Product Acceptance Criteria

The MVP is considered complete when the following scenario works end-to-end:

### Scenario

A new user registers, creates a business profile, uploads a valid transaction CSV, receives financial analytics, sees fraud analysis, receives an explainable Financial Trust Score, requests a prototype loan, runs an EMI simulation, receives an explainable prototype recommendation, sees potentially relevant government schemes, and uses the Financial Coach.

### Required Result

```text
Register
  ✓
Business Profile
  ✓
Transaction Upload
  ✓
Analytics
  ✓
Fraud Detection
  ✓
Trust Score
  ✓
Loan Assessment
  ✓
Loan Simulator
  ✓
Scheme Matching
  ✓
Financial Coach
  ✓
```

---

# 25. 10-Part Implementation Plan

The implementation is deliberately split into ten stages to preserve GitHub history and allow testing after each stage.

## Part 01 — Foundation + Architecture

### Scope

- Next.js setup
- FastAPI setup
- TypeScript
- Tailwind
- database abstraction
- environment configuration
- router structure
- `/health`
- architecture documentation

### Commit

```text
chore: initialize FinBridge project architecture
```

---

## Part 02 — Database + Authentication + Business Profile

### Scope

- users table
- businesses table
- migrations
- password hashing
- JWT
- register/login
- authenticated routes
- business onboarding

### Commit

```text
feat: add database schema authentication and business profiles
```

---

## Part 03 — Transaction Engine + FT-05 Analytics

### Scope

- transaction model
- CSV upload
- validation
- categorization
- revenue
- expenses
- cash flow
- charts
- demo data

### Commit

```text
feat: implement transaction ingestion and MSME financial analytics
```

---

## Part 04 — FT-02 Fraud Detection

### Scope

- fraud alerts
- deterministic rules
- Isolation Forest
- risk scoring
- alert dashboard

### Commit

```text
feat: add hybrid transaction fraud detection engine
```

---

## Part 05 — FT-03 Alternative Credit

### Scope

- feature engineering
- Financial Trust Score
- weighted scoring
- explainability
- credit profile persistence

### Commit

```text
feat: implement explainable alternative credit assessment
```

---

## Part 06 — FT-03 Loan Engine

### Scope

- loan application
- EMI calculation
- loan recommendation
- repayment burden
- loan simulator
- projected cash flow

### Commit

```text
feat: implement micro-loan assessment and repayment simulator
```

---

## Part 07 — FT-04 Government Scheme Engine

### Scope

- scheme database
- eligibility matching
- match score
- source links
- verification status

### Commit

```text
feat: add government scheme matching engine
```

---

## Part 08 — FT-01 Financial Coach + AI Layer

### Scope

- AI service abstraction
- financial coach
- contextual education
- fraud explanation
- scheme explanation
- deterministic fallback

### Commit

```text
feat: add contextual financial coaching and AI explanation layer
```

---

## Part 09 — Full Frontend Integration

### Scope

- complete navigation
- dashboard
- analytics
- fraud
- Trust Score
- loan
- simulator
- schemes
- coach
- API integration
- loading/error states
- responsive UI

### Commit

```text
feat: integrate complete FinBridge fintech dashboard
```

---

## Part 10 — Testing + Security + Deployment

### Scope

- full tests
- security review
- migrations
- production configuration
- deployment readiness
- README
- demo script
- judge questions

### Commit

```text
chore: finalize testing security deployment and hackathon readiness
```

---

# 26. Recommended Git Workflow

After each part:

```text
AI implements part
        ↓
Start application
        ↓
Run tests
        ↓
Review git diff
        ↓
Manually verify feature
        ↓
Fix bugs
        ↓
Commit
        ↓
Push
        ↓
Begin next part
```

## Recommended History

```text
main
│
├── chore: initialize FinBridge project architecture
├── feat: add database schema authentication and business profiles
├── feat: implement transaction ingestion and MSME financial analytics
├── feat: add hybrid transaction fraud detection engine
├── feat: implement explainable alternative credit assessment
├── feat: implement micro-loan assessment and repayment simulator
├── feat: add government scheme matching engine
├── feat: add contextual financial coaching and AI explanation layer
├── feat: integrate complete FinBridge fintech dashboard
└── chore: finalize testing security deployment and hackathon readiness
```

---

# 27. 48-Hour Execution Plan

## Hours 0–3 — Planning and Repository

- finalize architecture
- finalize user journey
- create repository
- start Part 01

## Hours 3–10 — Foundation and Auth

- finish Parts 01–02
- database
- authentication
- business onboarding

## Hours 8–16 — FT-05

- transaction upload
- categorization
- financial analytics
- dashboard foundation

## Hours 14–22 — FT-03 Credit + FT-02 Fraud

- fraud engine
- feature engineering
- Trust Score

## Hours 20–30 — Lending

- loan application
- EMI
- simulator
- prototype recommendation

## Hours 27–34 — FT-04 and FT-01

- scheme engine
- financial coach
- educational content

## Hours 32–40 — Integration

- dashboard
- complete UI
- end-to-end flow

## Hours 40–44 — Testing

- fix bugs
- validate demo data
- verify APIs
- test deployment

## Hours 44–48 — Submission and Demo

- final build
- README
- PPT
- demo recording backup
- final Git push

---

# 28. Demo Narrative

## Opening

Introduce a small business owner who needs working capital but has limited formal credit depth.

## Step 1 — Business Setup

Create the business profile.

## Step 2 — Financial Data

Upload transaction CSV.

## Step 3 — Financial Health

Show:

- revenue
- expenses
- cash flow
- expense ratio

## Step 4 — Risk

Open a suspicious transaction and show:

- high risk
- risk score
- reasons

## Step 5 — Alternative Credit

Generate:

**Financial Trust Score**

Show the components and explainability.

## Step 6 — Borrowing

Request ₹75,000.

Show:

- EMI
- projected cash flow
- prototype loan range
- supporting factors
- caution factors

## Step 7 — Schemes

Show relevant scheme matches with verification state and source.

## Step 8 — Coaching

Ask:

> Can I afford this loan?

Show the Financial Coach explaining the actual backend-calculated values.

## Closing Message

> **FinBridge does not simply ask whether a borrower has traditional credit. It uses financial behavior to construct an explainable financial profile and connects that intelligence to safer, more informed borrowing.**

---

# 29. Differentiation and Unfair-Advantage Concept

The primary differentiation is not “we use AI.”

The differentiating concept is the **Financial Behavior Graph**.

```text
              BUSINESS
                  │
      ┌───────────┼───────────┐
      │           │           │
   Revenue     Expenses   Transactions
      │           │           │
      └──────┬────┴──────┬────┘
             │           │
             ▼           ▼
        Cash Flow      Risk
             │           │
             └─────┬─────┘
                   ▼
            TRUST PROFILE
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
      Loan       Schemes    Coaching
```

The product's technical story is the integration of multiple financial signals into one explainable lending workflow.

---

# 30. Key Product Features That Strengthen the Demo

## 30.1 “Why This Loan?”

The system should explain the recommendation rather than merely show a numeric range.

## 30.2 “Why Not a Bigger Loan?”

If a larger amount causes an excessive prototype repayment burden, explain the cash-flow impact.

## 30.3 Loan What-If Simulator

Allow users to change amount and tenure and immediately see the impact on EMI and projected cash flow.

## 30.4 Credit Journey

Future concept:

```text
Initial Trust Score
      ↓
Better Expense Management
      ↓
Stable Cash Flow
      ↓
On-Time Repayment
      ↓
Improved Financial Profile
```

This is a future extension, not mandatory for the first 48-hour MVP.

---

# 31. Team Responsibilities

For a four-person team:

## Member 1 — Backend / Database

- FastAPI
- SQLAlchemy
- authentication
- schema
- APIs

## Member 2 — FinTech / ML

- transaction analytics
- fraud detection
- Trust Score
- loan calculations

## Member 3 — Frontend

- dashboard
- charts
- forms
- user journey
- responsive UI

## Member 4 — AI / Integration / Documentation

- Financial Coach
- scheme retrieval/matching
- demo data
- README
- presentation
- final integration

The team should integrate continuously rather than waiting until the last hour.

---

# 32. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Over-scoping | High | Preserve FT-03 core and defer extras |
| Frontend outpaces backend | High | Build backend logic first |
| AI API unavailable | Medium | Deterministic fallback |
| Bad demo data | High | Build and validate synthetic dataset early |
| Fraud model too complex | Medium | Use rules + Isolation Forest |
| Scheme data inaccurate | High | Use verified sources / demo labeling |
| Git history weak | High | Commit after each part |
| Calculation inconsistencies | High | Backend source of truth + unit tests |
| Security questions | Medium | Authentication + access control + no credentials |
| Deployment problems | High | Deploy before final hours |

---

# 33. Future Scope After Hackathon

The following are not required for the 48-hour prototype but form the production roadmap.

## Phase 2

- bank/financial-data integrations through compliant providers
- document-based financial statement ingestion
- richer merchant categorization
- advanced anomaly models
- repayment tracking
- richer scheme catalog
- multilingual support
- downloadable financial reports

## Phase 3

- regulated lending partnerships
- compliant KYC/AML workflows
- bureau-data integration where permitted
- model monitoring
- fairness testing
- explainability audit trails
- production-grade observability
- stronger data encryption and governance

---

# 34. Production Readiness Considerations

A production version would require domain-specific legal, regulatory, security, privacy, lending, KYC/AML, consumer-protection, and model-governance work beyond this hackathon prototype.

The hackathon implementation must not imply that these requirements are already satisfied.

---

# 35. Definition of Done

FinBridge is “done” for the hackathon MVP when:

- the application starts reliably
- a user can register/login
- a business profile can be created
- a transaction CSV can be uploaded
- financial analytics are generated
- fraud alerts are generated
- the Financial Trust Score is generated
- a prototype loan assessment can be completed
- EMI simulation works
- the recommendation is explainable
- scheme matches are displayed
- the Financial Coach works or falls back safely
- the full journey is usable from the frontend
- automated tests for core calculations pass
- no secrets are committed
- Git history clearly shows staged development
- a demo environment is available or locally reproducible
- README and demo documentation are complete

---

# 36. Judge-Facing Architecture Summary

The simplest explanation of the product is:

```text
FT-05
Financial Analytics
       ↓
FT-02
Fraud / Risk Signals
       ↓
FT-03
Alternative Credit Assessment
       ↓
FT-03
Micro-Lending + Loan Simulation
       ↓
FT-04
Government Scheme Discovery
       ↓
FT-01
Financial Coaching
```

The four supporting problem statements are valuable because they improve the FT-03 journey rather than existing as separate applications.

---

# 37. Judge Questions and Prepared Answers

## Why is FT-03 the core?

Because the product's primary user problem is access to explainable micro-lending. Financial analytics, fraud detection, scheme discovery, and education directly support that journey.

## Why alternative credit assessment?

Because the prototype needs to use additional financial-behavior signals when formal credit depth is limited.

## Why not use deep learning everywhere?

Because the prototype prioritizes explainability, deterministic calculations, available data, implementation speed, and a functioning end-to-end product.

## Why Isolation Forest?

It can provide unsupervised anomaly detection when a large labeled fraud dataset is not available for the hackathon prototype.

## How is the Trust Score explainable?

It is constructed from explicit components with documented weights and factor-level explanations.

## How do you prevent the AI from deciding a loan?

The financial calculations and loan logic are deterministic backend services. The LLM receives structured results and is used for explanation/coaching.

## How do you handle suspicious transactions?

The fraud engine produces a risk signal and reasons. It does not automatically reject the borrower.

## How do you handle bias?

The prototype excludes sensitive personal characteristics from its scoring model and focuses on financial/business behavior.

## How are schemes verified?

Each scheme record has a source and verification status, and the UI clearly labels scheme matching as informational.

## What happens if the LLM goes down?

The application falls back to deterministic explanations so core functionality remains available.

## Is this a real lending platform?

No. It is a hackathon prototype demonstrating the architecture and decision-support workflow. It does not disburse loans or guarantee lending decisions.

---

# 38. Final Product Statement

> **FinBridge is an explainable AI-powered financial intelligence and alternative-credit platform for MSMEs and self-employed individuals. It combines transaction analytics, fraud signals, alternative financial profiling, loan simulation, government-scheme discovery, and contextual financial coaching into one FT-03-centered lending journey.**

The fundamental product chain is:

> **Understand the business → detect risk → build financial trust → understand borrowing capacity → simulate the loan → discover support → improve financial behavior.**

---

# 39. Final Implementation Priority

If time becomes constrained, preserve features in this exact order:

```text
P0 — MUST HAVE

Transaction upload
Financial analytics
Fraud signals
Financial Trust Score
Loan assessment
Loan simulator
Explainable recommendation

P1 — SHOULD HAVE

Scheme matching
Financial Coach
Complete dashboard

P2 — NICE TO HAVE

Repayment journey
PDF reports
Multilingual support
Advanced ML
Live integrations
```

If scope must be cut, cut P2 first. Do not sacrifice the P0 chain.

---

# 40. Source and Scope Notes

This PRD consolidates the requirements, architecture, feature decisions, technical roadmap, Git workflow, demo approach, and implementation strategy established throughout the project discussion.

The five problem statements are based on the organizer-provided FinTech problem-statement material supplied in the project conversation.

Competition context is based on the current Hack 2 Ignite 2026-27 Unstop listing as of 16 Sep 2026, including the 48-hour online qualifier, GitHub-history review, Top 30 final-round shortlist, evaluation dimensions, and inter-college eligibility.

Where this PRD proposes implementation details such as scoring weights, technology choices, module names, APIs, data schemas, or demo data, those are **project design decisions for the prototype**, not statements that the hackathon organizer mandates them.

---

# 41. Final One-Line Pitch

> **FinBridge turns everyday MSME financial behavior into an explainable financial profile that supports safer micro-lending, fraud awareness, financing-opportunity discovery, and smarter financial decisions.**

---

# 42. Final Build Sequence

```text
PART 01
Foundation
    ↓
PART 02
Auth + Business
    ↓
PART 03
FT-05 Analytics
    ↓
PART 04
FT-02 Fraud
    ↓
PART 05
FT-03 Trust Score
    ↓
PART 06
FT-03 Lending
    ↓
PART 07
FT-04 Schemes
    ↓
PART 08
FT-01 + AI Coach
    ↓
PART 09
Frontend Integration
    ↓
PART 10
Testing + Deployment
    ↓
48-HOUR DEMO
```

**End of PRD**
