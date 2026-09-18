# FINBRIDGE — Complete Project Documentation & System Guide

> **AI-Powered Inclusive Micro-Lending & Financial Intelligence Platform**  
> **Hackathon:** Hack2Ignite  
> **Track:** FT-03 (Secure Micro-Lending)  
> **Team RAY:** Ruturaj Vasudev Bhome & Akhilesh Lalitkumar Dhumal  
> **Live Dev Ports:** Frontend: `http://localhost:3000` | Backend API: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

---

## Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Unified Architecture & Problem Mapping (FT-01 to FT-05)](#2-unified-architecture--problem-mapping-ft-01-to-ft-05)
3. [End-to-End System Workflow (Data Journey)](#3-end-to-end-system-workflow-data-journey)
4. [Complete Page-by-Page Breakdown (Frontend)](#4-complete-page-by-page-breakdown-frontend)
   - [Landing & Public Pages](#41-landing--public-pages)
   - [Authentication & Onboarding](#42-authentication--onboarding)
   - [Core Intelligence & Dashboard](#43-core-intelligence--dashboard)
   - [Risk, Lending & Advisory](#44-risk-lending--advisory)
5. [Machine Learning & Algorithmic Engines](#5-machine-learning--algorithmic-engines)
   - [Alternative Credit / Trust Score Engine](#51-alternative-credit--trust-score-engine-ft-03)
   - [Fraud Surveillance & Anomaly Detection](#52-fraud-surveillance--anomaly-detection-ft-02)
   - [Loan Underwriting & Affordability Math](#53-loan-underwriting--affordability-math-ft-03)
   - [Government Scheme Matching Engine](#54-government-scheme-matching-engine-ft-04)
   - [Contextual AI Financial Copilot](#55-contextual-ai-financial-copilot-ft-01)
6. [Backend Architecture & Database Schema](#6-backend-architecture--database-schema)
   - [FastAPI Monolith Structure](#61-fastapi-monolith-structure)
   - [Database Entity-Relationship (ER) Schema](#62-database-entity-relationship-er-schema)
   - [Complete REST API Catalog](#63-complete-rest-api-catalog)
7. [Frontend Design System & Styling Architecture](#7-frontend-design-system--styling-architecture)
8. [Codebase Sitemap & File Directory](#8-codebase-sitemap--file-directory)
9. [Local Setup, Execution & Verification](#9-local-setup-execution--verification)

---

## 1. Executive Summary & Problem Statement

### The Problem: The CIBIL Blindspot
In India, over **63 million Micro, Small, and Medium Enterprises (MSMEs)** generate roughly 30% of the nation's GDP and employ over 110 million people. However, more than **85% of these enterprises lack access to formal credit**. 

Traditional commercial banking relies on **CIBIL / credit bureau scores**, multi-year audited balance sheets, and tangible collateral (property, gold, fixed deposits). Micro-merchants, local retailers, kirana store owners, and freelancers operate largely in the informal or digital cash-flow domain (UPI, QR codes, weekly vendor payouts). Because they have never taken a formal commercial bank loan, they have no CIBIL score:
- **No credit score $\rightarrow$ No formal bank loan $\rightarrow$ Driven to informal loan sharks charging 36%–120% APR $\rightarrow$ Debt traps and business failure.**

### The Solution: FINBRIDGE
**FINBRIDGE** replaces traditional collateral with **Mathematical Trust**. Instead of asking for land titles or CIBIL histories, FINBRIDGE analyzes the applicant's **live digital financial exhaust**:
- 6 months of UPI/bank transaction streams
- Cash-flow volatility and minimum daily balance resilience
- Revenue growth trajectory and expense discipline
- Velocity and circular transaction fraud signals

From this real-world exhaust, FINBRIDGE computes an **Alternative Trust Score (300 to 850)**, executes automated risk-adjusted micro-loan underwriting, cross-matches eligible government subsidy schemes (Mudra, PMEGP, PM Vishwakarma), and provides a hyper-contextual AI Financial Copilot.

---

## 2. Unified Architecture & Problem Mapping (FT-01 to FT-05)

FINBRIDGE uniquely combines 5 fintech problem statements into a single, cohesive modular platform:

| Code | Problem Statement | How FINBRIDGE Implements It |
| :--- | :--- | :--- |
| **FT-03** *(Core)* | **Secure Micro-Lending** | Alternative credit scoring engine (300–850), instant underwriting, debt-service coverage ratio (DSCR) validation, interactive loan EMI & affordability simulator. |
| **FT-05** | **Financial Analytics** | Ingests raw bank/UPI CSVs, auto-categorizes credits vs. debits, normalizes historical cash flows, projects net cash surplus and burn rates. |
| **FT-02** | **Fraud & Risk Signal** | Multi-layered fraud shield combining heuristic velocity rules with an **Isolation Forest ML model** to detect abnormal spikes, round-tripping, and suspicious transfers. |
| **FT-04** | **Government Scheme Discovery** | Automated eligibility matcher cross-referencing MSME business parameters (sector, vintage, turnover, category) against Indian national schemes (PMEGP, MUDRA, PM Vishwakarma, CGTMSE). |
| **FT-01** | **Financial Literacy & Copilot** | Contextual AI financial advisor grounded in the applicant's real-time transaction telemetry, explaining loan affordability, debt traps, and cash flow bottlenecks. |

```text
               ┌─────────────────────────────────────────────────────────┐
               │                 MSME USER / BORROWER                    │
               └────────────────────────────┬────────────────────────────┘
                                            │ Uploads Bank/UPI CSV or Enters Demo
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FINBRIDGE PLATFORM                                     │
│                                                                                        │
│  ┌───────────────────────┐       ┌───────────────────────┐       ┌──────────────────┐  │
│  │ FT-05: Data Analytics │ ────> │   FT-02: Fraud Shield │ ────> │ FT-03: Alt Trust │  │
│  │ Ingestion, Normal-    │       │   Isolation Forest +  │       │ Scoring (300-850)│  │
│  │ ization & Cash Flow   │       │   Velocity Anomaly    │       │ Affordability    │  │
│  └───────────────────────┘       └───────────────────────┘       └─────────┬────────┘  │
│                                                                            │           │
│                                   ┌────────────────────────────────────────┴────────┐  │
│                                   ▼                                                 ▼  │
│                     ┌───────────────────────────┐                     ┌─────────────┴┐ │
│                     │ FT-03: Loan Underwriting  │                     │ FT-04: Govt  │ │
│                     │ & Affordability Simulator │                     │ Schemes Match│ │
│                     └─────────────┬─────────────┘                     └──────────────┘ │
│                                   │                                                    │
│                                   ▼                                                    │
│                     ┌───────────────────────────┐                                      │
│                     │ FT-01: AI Financial Coach │                                      │
│                     │ Contextual Debt Guidance  │                                      │
│                     └───────────────────────────┘                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. End-to-End System Workflow (Data Journey)

### Step 1: Authentication & Identity Provisioning
1. The user lands on the Home Page (`/`) and proceeds to `/register` or `/login`.
2. Client-side authentication is handled via **Firebase Auth** (Modular SDK v10.14.1) using Email/Password or 1-Click Demo Login.
3. Upon Firebase credential generation, the frontend retrieves the Firebase ID Token (JWT).
4. The client issues a handshake to the FastAPI backend at `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.
5. The backend validates the JWT using the **Firebase Admin SDK** (with an offline fallback for local hackathon resilience) and idempotently provisions or fetches the user record in SQLite.

### Step 2: MSME Business Registration & Onboarding
1. First-time users navigate to `/onboarding`.
2. The user registers their business identity:
   - **Business Name** (e.g., *"Shree Digital Solutions"*)
   - **Registration / GSTIN Number** (e.g., `27AADCS1494F1Z1`)
   - **Industry Sector** (Retail, Manufacturing, Services, Food & Agri, Tech)
   - **Years in Operation / Vintage** (e.g., 4 years)
   - **Annual Turnover Bracket** (e.g., ₹10L - ₹50L)
3. Persisted via `POST /api/v1/business` linked directly to `current_user.id`.

### Step 3: Transaction Ingestion & Telemetry Processing
1. The user uploads bank or UPI statement CSVs at `/transactions` (or clicks **"Load Demo Data"** at `/dashboard`).
2. `POST /api/v1/transactions/upload`:
   - Fast CSV parsing and schema normalization (supports date, description, amount, type, merchant).
   - Ingestion summary calculated: total records, gross credits, gross debits, net flow, date span.
   - Saves all individual records into the `transactions` table.

### Step 4: Multi-Layer Fraud Surveillance
1. Every ingested batch passes through `FraudEngine`:
   - **Velocity Checks**: Multiple rapid transfers within minutes to unknown entities.
   - **Circular / Round-Trip Detection**: Rapid inflows matched immediately by identical outflows.
   - **Isolation Forest Unsupervised ML**: Evaluates transaction amounts, intervals, and frequency to spot statistical outliers.
2. Suspicious events generate records in the `fraud_alerts` table (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
3. Total fraud penalty score directly feeds into the Credit Scoring Engine as a risk deduction.

### Step 5: Real-Time Cash Flow Analytics
1. The analytics service aggregates monthly cash inflows, outflows, minimum balance history, and burn rates.
2. Generates metrics:
   - **Average Monthly Revenue**: e.g., ₹2,60,931.86
   - **Average Monthly Expenses**: e.g., ₹2,53,886.40
   - **Net Monthly Cash Surplus**: e.g., ₹7,045.46
   - **Cash Flow Volatility**: Coefficient of variation across operating months.

### Step 6: Alternative Trust Score Calculation
1. The backend executes `calculate_credit_profile(business_id)`:
   - Evaluates 5 mathematical pillars: Revenue Stability (25%), Expense Discipline (20%), Cash Buffer (20%), Business Vintage (15%), Growth Momentum (10%), with a Fraud Risk Penalty (-10%).
   - Generates an integer **Trust Score** between **300 and 850**.
   - Calculates **Confidence Level** (High/Medium/Low based on transaction history duration).
   - Generates **Explainability Factors** (positive and negative driving signals).
   - Computes **Maximum Recommended Credit Limit** (e.g., ₹5,00,000).

### Step 7: Micro-Loan Application & Affordability Simulation
1. The user explores loan options at `/loan` or stress-tests borrowing at `/loan/simulator`.
2. The user adjusts Principal (₹50k to ₹25L), Tenure (3 to 36 months), and Interest Rate.
3. The engine computes:
   - Monthly EMI using standard amortization: $EMI = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}$
   - Debt-Service Burden Ratio: $\text{Burden} = \frac{\text{EMI}}{\text{Monthly Net Surplus}} \times 100$
   - Real-time Warning Banners: Triggers dynamic alerts if EMI exceeds 50% or 100% of cash surplus.
4. If approved, application is submitted via `POST /api/v1/loans/apply`.

### Step 8: Government Scheme Discovery & Grants
1. Navigating to `/schemes` triggers `POST /api/v1/schemes/match`.
2. Matches the MSME profile against central Indian schemes:
   - **MUDRA (Tarun/Kishore/Shishu)**: Uncollateralized loans up to ₹10 Lakhs.
   - **PMEGP**: Up to 35% capital subsidy for micro-enterprises.
   - **PM Vishwakarma**: ₹1–2 Lakhs at subsidized 5% interest for artisans.
   - **CGTMSE**: Credit guarantee cover up to ₹2 Crore for collateral-free MSME loans.
3. Displays eligibility score, match reasons, subsidy percentage, and official portal application links.

### Step 9: Contextual AI Financial Copilot
1. At `/financial-coach`, the user chats with the AI Advisor.
2. Every prompt is automatically injected with the borrower's live financial context (Revenue, Surplus, Fraud alerts, Trust Score, Current loan burden).
3. The Copilot delivers actionable, grounded advice without generic platitudes (e.g., *"Your monthly surplus is only ₹7,045. A ₹25,000 EMI will cause an immediate default within 30 days. Consider a smaller ₹50,000 tranche over 12 months"*).

---

## 4. Complete Page-by-Page Breakdown (Frontend)

The frontend is a modern, responsive Single Page Application built with **React 18 + Vite + TypeScript** and pure Vanilla CSS.

```text
Page Routing Tree:
├── / (HomePage)
├── /login (LoginPage)
├── /register (RegisterPage)
├── /onboarding (OnboardingPage) [Protected]
└── /dashboard (DashboardLayout) [Protected]
    ├── /dashboard (DashboardPage)
    ├── /transactions (TransactionsPage)
    ├── /analytics (AnalyticsPage)
    ├── /credit-profile (CreditProfilePage)
    ├── /fraud-alerts (FraudAlertsPage)
    ├── /loan (LoanPage)
    ├── /loan/simulator (LoanSimulatorPage)
    ├── /schemes (SchemesPage)
    └── /financial-coach (FinancialCoachPage)
```

---

### 4.1 Landing & Public Pages

#### 1. Home / Landing Page (`/` $\rightarrow$ `HomePage.tsx`)
- **Purpose**: High-impact marketing & product introduction explaining the FINBRIDGE value proposition to MSME owners and lenders.
- **Visual Design**: Sleek dark fintech theme, animated gradient backdrops, glassmorphism cards.
- **Key Sections**:
  - **Hero Section**: Headline *"Inclusive Micro-Lending for India's 63M MSMEs"*, CTAs *"Launch App"* & *"Explore Demo"*, live metrics pill (`63M+ Unbanked`, `0 Collateral Needed`).
  - **Live Architecture Pipeline**: Visual diagram linking Ingestion $\rightarrow$ Risk $\rightarrow$ Trust Score $\rightarrow$ Micro-Loan.
  - **Problem vs. Solution Grid**: Side-by-side comparison of Traditional Banks (CIBIL dependent, 3-week delays, collateral required) vs. FINBRIDGE (Alternative data, 90-second scoring, uncollateralized).
  - **Feature Showcase**: Deep dive into the 5 modules (Analytics, Fraud Shield, Trust Score, Government Schemes, AI Coach).
  - **Interactive Micro-Loan Calculator Preview**: Quick teaser slider allowing visitors to estimate monthly repayments.
  - **Footer & Social Links**: Quick access navigation, API status indicators.

---

### 4.2 Authentication & Onboarding

#### 2. Sign In Page (`/login` $\rightarrow$ `LoginPage.tsx`)
- **Purpose**: Authenticate existing users and provide instant 1-click demo access for evaluators.
- **Components & Features**:
  - Email & Password input fields with real-time validation.
  - **"Try Demo Mode" Button**: Instant 1-click access that automatically logs in as `demo@finbridge.in` and redirects straight to `/dashboard`.
  - Secure error banner handling invalid credentials or Firebase auth errors.
  - Link to `/register`.

#### 3. Sign Up Page (`/register` $\rightarrow$ `RegisterPage.tsx`)
- **Purpose**: Onboard new users into Firebase Auth and the backend database.
- **Components & Features**:
  - Full Name, Email, Password, Confirm Password inputs.
  - **Smart Re-auth Fallback**: If an account already exists in Firebase during a retry, it seamlessly signs in, synchronizes the database profile, and forwards the user to `/onboarding`.
  - Redirects to `/onboarding` upon completion.

#### 4. Business Onboarding Page (`/onboarding` $\rightarrow$ `OnboardingPage.tsx`)
- **Purpose**: Capture the foundational business metadata required for credit scoring and government scheme matching.
- **Form Inputs**:
  - Business Name (e.g., *"Shree Digital Solutions"*)
  - Registration Number / GSTIN
  - Industry Sector dropdown (Retail, Wholesale, Manufacturing, Services, Technology, Food/Agri)
  - Years in Operation (Vintage number)
  - Estimated Annual Turnover range
- **Workflow**: Calls `POST /api/v1/business` and redirects to `/dashboard`.

---

### 4.3 Core Intelligence & Dashboard

#### 5. Main Dashboard (`/dashboard` $\rightarrow$ `DashboardPage.tsx`)
- **Purpose**: Central command center providing an instant pulse of business health, credit eligibility, and financial metrics.
- **Components & Features**:
  - **Header Banner**: Greeting (*"Good day, Shree Digital Solutions"*), transaction counter, and **"Load Demo Data"** action button.
  - **Metric Cards (Row 1)**:
    - *Avg Monthly Revenue*: e.g., ₹2,60,931.86 (with trend indicator).
    - *Avg Monthly Expenses*: e.g., ₹2,53,886.40.
    - *Net Cash Flow*: e.g., ₹7,045.46 (with positive/negative liquidity flag).
    - *Fraud Risk Status*: Low / Medium / High badge with risk indicator icon.
  - **Trust Score Spotlight (Row 2)**:
    - Large circular score gauge showing current score (e.g., **734 / 850**).
    - Credit Tier pill (*"Prime Tier MSME"*).
    - Recommended Max Loan Limit (e.g., ₹5,00,000).
    - Direct CTA: *"Simulate Loan EMI"*.
  - **Recent Activity Ledger & Quick Links**: Shortcuts to Schemes, Fraud Alerts, and AI Coach.

#### 6. Transaction Ingestion & Ledger (`/transactions` $\rightarrow$ `TransactionsPage.tsx`)
- **Purpose**: Upload new statements, view historical transaction logs, and inspect categorization.
- **Components & Features**:
  - **Drag-and-Drop CSV Upload Zone**: Accepts standard bank and UPI statement exports.
  - **Batch Summary Stats**: Displays total count, gross credit volume, gross debit volume, net cash flow.
  - **Interactive Filter Bar**: Filter by Date Range, Type (All, Credit, Debit), or search by Merchant/Description.
  - **Paginated Transaction Table**: Columns for Date, Description, Merchant, Type (green credit / red debit pill), and Amount in INR (₹).

#### 7. Financial Analytics (`/analytics` $\rightarrow$ `AnalyticsPage.tsx`)
- **Purpose**: Deep financial diagnostics for both borrower self-awareness and lender risk auditing.
- **Components & Features**:
  - **Monthly Inflow vs. Outflow Chart**: Recharts bar chart showing month-over-month revenue vs. expenses.
  - **Net Cash Flow Curve**: Area chart illustrating liquidity spikes and lean periods.
  - **Expense Categorization Breakdown**: Donut chart splitting expenditures across Inventory, Salaries, Rent, Utilities, and Discretionary.
  - **Volatility & Burn Rate Cards**: Diagnostic meters showing cash buffer days and operating margin health.

---

### 4.4 Risk, Lending & Advisory

#### 8. Alternative Credit Profile (`/credit-profile` $\rightarrow$ `CreditProfilePage.tsx`)
- **Purpose**: Detailed transparency and explainability behind the Alternative Trust Score (FT-03).
- **Components & Features**:
  - **Trust Score Breakdown (300–850)**: Visual gauge with color-coded risk bands.
  - **Pillar Weighting Breakdown**:
    - Revenue Stability (Score & Weight: 25%)
    - Expense Discipline (Score & Weight: 20%)
    - Cash Buffer & Liquidity (Score & Weight: 20%)
    - Business Vintage (Score & Weight: 15%)
    - Growth Trajectory (Score & Weight: 10%)
    - Fraud Deductions (-10%)
  - **Explainability Drivers (SHAP-Style Insights)**:
    - *Positive Signals* (e.g., *"Consistent daily UPI inflows over 180 days"*, *"Low debt obligations"*).
    - *Risk Warnings* (e.g., *"High month-end liquidity dip"*, *"Single large irregular transfer noticed"*).
  - **Lender Underwriting Recommendation**: Instant automated pre-approval limit.

#### 9. Fraud Surveillance & Alerts (`/fraud-alerts` $\rightarrow$ `FraudAlertsPage.tsx`)
- **Purpose**: Active surveillance feed showing suspicious activities detected by the Isolation Forest model and rule engines (FT-02).
- **Components & Features**:
  - **Risk Summary Header**: Active alert count, overall risk level (Low, Moderate, High, Critical), total flagged transaction volume.
  - **Filter Tabs**: Filter alerts by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - **Alert Feed Cards**:
    - Alert Title & Category (e.g., *"Rapid Velocity Anomaly"*, *"Circular Inflow/Outflow Pattern"*).
    - Flagged Transaction Details: Timestamp, Merchant, Amount.
    - Anomaly Reason & Detection Method (Isolation Forest vs. Heuristic Rule).
    - Status Badge: `OPEN`, `RESOLVED`, `FALSE_POSITIVE`.

#### 10. Micro-Loan Application (`/loan` $\rightarrow$ `LoanPage.tsx`)
- **Purpose**: Submit formal loan applications and view active micro-loan statuses.
- **Components & Features**:
  - **Pre-Approved Limit Banner**: Informs borrower of their algorithmic credit ceiling based on their Trust Score.
  - **Loan Application Form**:
    - Loan Purpose (Working Capital, Equipment Purchase, Inventory Restock, Store Expansion).
    - Requested Amount (with real-time ceiling cap).
    - Requested Tenure (3, 6, 12, 18, 24 months).
  - **Application History Table**: Status tracker for existing applications (`PENDING`, `APPROVED`, `DISBURSED`, `REJECTED`).

#### 11. Loan EMI & Affordability Simulator (`/loan/simulator` $\rightarrow$ `LoanSimulatorPage.tsx`)
- **Purpose**: Interactive debt-stress test tool that prevents MSMEs from falling into dangerous debt cycles.
- **Components & Features**:
  - **Interactive Sliders**:
    - *Principal Amount*: ₹50,000 to ₹25,00,000
    - *Tenure*: 3 months to 36 months
    - *Interest Rate*: 8.0% to 24.0% APR
  - **Preset Quick-Select Cards**: 1-click presets for ₹1 Lakh (6 mos), ₹5 Lakhs (12 mos), ₹10 Lakhs (24 mos).
  - **Affordability Math & Real-Time Alert Engine**:
    - Calculates exact Monthly EMI, Total Interest, and Total Repayment.
    - Compares calculated EMI directly against the applicant's real **Monthly Net Cash Surplus**.
    - **Repayment Burden Alert**:
      - If EMI consumes $> 100\%$ of surplus $\rightarrow$ Red alert: *"Severe Debt Burden Alert: EMI exceeds monthly cash surplus. Default risk is imminent."*
      - If EMI consumes $50\% - 100\%$ $\rightarrow$ Amber warning: *"High Repayment Burden: Consider extending tenure to protect liquidity."*
      - If EMI is $< 50\%$ $\rightarrow$ Emerald check: *"Affordable: EMI fits comfortably within your cash buffer."*

#### 12. Government Scheme Matching (`/schemes` $\rightarrow$ `SchemesPage.tsx`)
- **Purpose**: Automatic discovery of central and state government subsidies, grants, and credit guarantees (FT-04).
- **Components & Features**:
  - **Matched Schemes Grid**: Cards for MUDRA, PMEGP, CGTMSE, Stand-Up India, PM Vishwakarma.
  - **Eligibility Match Meter**: Match percentage (e.g., 95% Match) based on sector, vintage, and turnover.
  - **Key Benefit Callouts**: Maximum subsidy amount, interest subvention rates, collateral exemption terms.
  - **Application Checklist & Portal Links**: Official guidance on required documents (Udyam, Aadhaar, PAN) and outbound links to government application portals (e.g., `udyamregistration.gov.in`, `kviconline.gov.in`).

#### 13. Contextual AI Financial Coach (`/financial-coach` $\rightarrow$ `FinancialCoachPage.tsx`)
- **Purpose**: Financial literacy copilot grounded in the business's actual financial data (FT-01).
- **Components & Features**:
  - **Context-Aware Chat Interface**: Ask any question regarding loans, cash flow management, taxation, or vendor terms.
  - **Pre-set Prompt Suggestions**:
    - *"How can I improve my Trust Score to get a lower interest rate?"*
    - *"Is it safe for me to borrow ₹3 Lakhs right now?"*
    - *"Where am I spending the most money this quarter?"*
    - *"Which government scheme gives me the highest capital subsidy?"*
  - **Telemetry Badge**: Displays the real-time context payload injected into the prompt (Score, Monthly Revenue, Net Surplus).

#### 14. 404 Not Found Page (`*` $\rightarrow$ `NotFoundPage.tsx`)
- **Purpose**: Friendly, dark-themed fallback page for non-existent routes with a 1-click button to return to `/dashboard`.

---

## 5. Machine Learning & Algorithmic Engines

The intelligence core resides in `backend/app/ml/` and `backend/app/services/`:

```text
backend/app/ml/
├── feature_engineering.py   (Extracts 24 financial ratios from raw transactions)
├── credit_scoring.py        (Alternative Credit Scoring algorithm 300-850)
├── fraud_engine.py          (Isolation Forest + Heuristic Velocity Checks)
└── loan_engine.py           (Debt-Service Underwriting & Amortization Math)
```

---

### 5.1 Alternative Credit / Trust Score Engine (FT-03)

The **Alternative Trust Score** produces a credit score between **300 and 850**, mirroring the conventional CIBIL range but computed entirely from transaction streams:

$$\text{Trust Score} = 300 + 5.5 \times \sum_{i=1}^{5} \left( w_i \cdot S_i \right) - P_{\text{fraud}}$$

Where each sub-pillar $S_i$ is scored from 0 to 100:

| Pillar | Weight ($w_i$) | Core Signals Analyzed |
| :--- | :---: | :--- |
| **1. Revenue Stability** | 25% | Monthly inflow variance, revenue consistency index, frequency of recurring customer payments. |
| **2. Expense Discipline** | 20% | Operating expense ratio ($\text{Debits} / \text{Credits}$), absence of rapid overdraft depletion, vendor payment consistency. |
| **3. Cash Buffer & Liquidity** | 20% | Average daily closing balance, minimum balance ratio, days of runway available without revenue. |
| **4. Business Vintage** | 15% | Years in operation, transaction history depth (minimum 90 days recommended for high confidence). |
| **5. Growth Momentum** | 10% | Quarter-over-quarter revenue trend line slope, growth in transaction velocity. |
| **Risk Penalty ($P_{\text{fraud}}$)** | Variable | Point deduction based on active fraud alerts (up to 75 points deducted for critical velocity or circular transaction flags). |

#### Score Tiers & Underwriting Actions:
- **750 – 850 (Prime Tier)**: Instant pre-approval, lowest interest bracket (8.5% - 11.5%), max loan limit up to 3x monthly revenue.
- **650 – 749 (Good Tier)**: Automated approval, standard interest bracket (12% - 14.5%), max loan limit up to 2x monthly revenue.
- **550 – 649 (Fair Tier)**: Conditional approval, requires co-guarantee or lower tenure, interest (15% - 18%).
- **300 – 549 (Subprime / High Risk)**: Application declined for micro-loans; user directed to grant schemes or coached on improving runway.

---

### 5.2 Fraud Surveillance & Anomaly Detection (FT-02)

Implemented in `backend/app/ml/fraud_engine.py`, the fraud shield operates on two complimentary layers:

1. **Unsupervised Machine Learning (Isolation Forest)**:
   - Evaluates multi-dimensional transaction vectors: `[amount, interval_since_last_txn, hour_of_day, deviation_from_mean]`.
   - Isolates observations that require fewer decision splits in the randomized tree ensemble.
   - Outputs an anomaly score between $-1.0$ (severe anomaly) and $+1.0$ (normal).
2. **Rule-Based Heuristic Engines**:
   - **Velocity Anomaly**: More than 3 debits of $> \text{₹25,000}$ within a 30-minute window to unverified or new counterparties.
   - **Circular / Round-Trip Ingestion**: Inflow of ₹$X$ followed by outflow of $\approx \text{₹}X$ within 24 hours to create artificial revenue volume.
   - **Dormant Account Spike**: Sudden high-value transaction on an account with $< 3$ transactions in preceding 60 days.

---

### 5.3 Loan Underwriting & Affordability Math (FT-03)

Implemented in `backend/app/ml/loan_engine.py`:

1. **Maximum Borrowable Limit**:
   $$\text{Max Limit} = \min\left( \text{Avg Monthly Revenue} \times 2.5, \quad \frac{\text{Monthly Net Surplus} \times \text{Tenure}}{1.5} \right)$$
2. **Standard Monthly EMI Amortization**:
   $$EMI = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$
   *(where $P$ = principal, $r$ = monthly interest rate $\frac{\text{APR}}{12 \times 100}$, $n$ = tenure in months)*
3. **Debt-Service Burden Ratio (DSBR)**:
   $$DSBR = \frac{EMI}{\text{Monthly Net Cash Surplus}} \times 100\%$$
   - **Safe ($DSBR \le 40\%$)**: Approved.
   - **Moderate ($40\% < DSBR \le 60\%$)**: Warning issued, recommend longer tenure.
   - **Dangerous ($DSBR > 60\%$)**: Blocked by underwriting engine.

---

### 5.4 Government Scheme Matching Engine (FT-04)

Implemented in `backend/app/services/scheme_matching.py`:
Cross-references business parameters against eligibility matrices for Indian national micro-enterprise support:
- **PMEGP (Prime Minister's Employment Generation Programme)**:
  - Manufacturing up to ₹50L, Services up to ₹20L.
  - Subsidies: 15%–35% based on urban/rural and category.
- **Pradhan Mantri MUDRA Yojana**:
  - *Shishu* (Up to ₹50,000), *Kishore* (₹50,000 to ₹5,00,000), *Tarun* (₹5,00,000 to ₹10,00,000).
  - No collateral required.
- **PM Vishwakarma**:
  - Reserved for traditional artisans and craftspeople.
  - Collateral-free enterprise development loan of ₹1 Lakh (Phase 1) and ₹2 Lakhs (Phase 2) at 5% concessional interest.
- **CGTMSE**:
  - Covers credit facilities up to ₹200 Lakhs without third-party guarantee.

---

### 5.5 Contextual AI Financial Copilot (FT-01)

Implemented in `backend/app/services/coach.py` and `ai_service.py`:
- **Context Grounding**: Unlike generic chatbots, FINBRIDGE constructs a rich system prompt dynamically populated with:
  ```json
  {
    "business_name": "Shree Digital Solutions",
    "turnover_range": "10L - 50L",
    "avg_monthly_revenue": 260931.86,
    "avg_monthly_expenses": 253886.40,
    "net_monthly_surplus": 7045.46,
    "trust_score": 734,
    "credit_tier": "Prime",
    "active_fraud_alerts": 0
  }
  ```
- **Fallback Architecture**: Supports Google Gemini API (`GEMINI_API_KEY`) and local Ollama (`LLM_PROVIDER=ollama`), with a built-in deterministic heuristic rule fallback that provides high-quality guidance even if no external AI API key is configured.

---

## 6. Backend Architecture & Database Schema

### 6.1 FastAPI Monolith Structure
Built using Python 3.12+ and FastAPI with asynchronous SQLAlchemy 2.0:
- **Lifespan Manager**: Initializes SQLite tables and the Firebase Admin SDK on startup.
- **Dependency Injection**:
  - `get_db`: Yields asynchronous SQLAlchemy session (`AsyncSession`).
  - `get_current_user`: Decodes and validates Firebase JWT token, injecting the authenticated `User` model into endpoints.
- **CORS Middleware**: Pre-configured for `http://localhost:3000`, `http://127.0.0.1:3000`, and production origins.

---

### 6.2 Database Entity-Relationship (ER) Schema

```text
┌────────────────┐       1:1       ┌──────────────────┐
│     users      ├─────────────────┤    businesses    │
│────────────────│                 │──────────────────│
│ id (PK)        │                 │ id (PK)          │
│ firebase_uid   │                 │ user_id (FK)     │
│ email          │                 │ business_name    │
│ full_name      │                 │ reg_number       │
│ role           │                 │ industry_type    │
│ created_at     │                 │ years_in_op      │
└────────────────┘                 └─────────┬────────┘
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       │ 1:N                 │ 1:1                 │ 1:N
                       ▼                     ▼                     ▼
              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
              │   transactions   │  │ credit_profiles  │  │   fraud_alerts   │
              │──────────────────│  │──────────────────│  │──────────────────│
              │ id (PK)          │  │ id (PK)          │  │ id (PK)          │
              │ business_id (FK) │  │ business_id (FK) │  │ business_id (FK) │
              │ txn_date         │  │ trust_score      │  │ txn_id (FK)      │
              │ amount           │  │ confidence       │  │ alert_type       │
              │ txn_type         │  │ max_credit_limit │  │ severity         │
              │ description      │  │ factor_breakdown │  │ reason           │
              │ merchant         │  │ is_stale         │  │ status           │
              └──────────────────┘  └──────────────────┘  └──────────────────┘
                       │
                       ├─────────────────────┐
                       │ 1:N                 │ 1:N
                       ▼                     ▼
              ┌──────────────────┐  ┌──────────────────┐
              │      loans       │  │  scheme_matches  │
              │──────────────────│  │──────────────────│
              │ id (PK)          │  │ id (PK)          │
              │ business_id (FK) │  │ business_id (FK) │
              │ amount           │  │ scheme_id (FK)   │
              │ tenure_months    │  │ match_score      │
              │ interest_rate    │  │ match_reasons    │
              │ monthly_emi      │  │ status           │
              │ status           │  └──────────────────┘
              └──────────────────┘
```

---

### 6.3 Complete REST API Catalog

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server liveness & status probe | No |
| `POST` | `/api/v1/auth/register` | Idempotent user registration & sync | Firebase JWT |
| `POST` | `/api/v1/auth/login` | Session verification & user lookup | Firebase JWT |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Firebase JWT |
| `POST` | `/api/v1/business` | Create / register MSME business | Firebase JWT |
| `GET` | `/api/v1/business/me` | Retrieve current user's business | Firebase JWT |
| `POST` | `/api/v1/transactions/upload` | Upload & ingest bank statement CSV | Firebase JWT |
| `GET` | `/api/v1/transactions` | Query filtered & paginated transactions | Firebase JWT |
| `GET` | `/api/v1/analytics/summary` | Retrieve aggregated cash flow analytics | Firebase JWT |
| `GET` | `/api/v1/credit/profile` | Compute / fetch Alternative Trust Score | Firebase JWT |
| `GET` | `/api/v1/fraud/alerts` | List active fraud & velocity alerts | Firebase JWT |
| `POST` | `/api/v1/loans/apply` | Submit formal micro-loan application | Firebase JWT |
| `GET` | `/api/v1/loans` | List user's active loan applications | Firebase JWT |
| `POST` | `/api/v1/loans/simulate` | Execute repayment & affordability math | No (Public) |
| `POST` | `/api/v1/schemes/match` | Evaluate & match government schemes | Firebase JWT |
| `POST` | `/api/v1/coach/chat` | Chat with contextual AI Financial Copilot | Firebase JWT |
| `POST` | `/api/v1/demo/seed` | Seed 6 months of Shree Digital Solutions data | Firebase JWT |

---

## 7. Frontend Design System & Styling Architecture

The application adopts a **Modern Dark Fintech Aesthetic** optimized for clarity, elegance, and density:
- **Color Palette**:
  - Background: Deep Slate `#0b0f19` and Dark Navy `#0f172a`
  - Surface Cards: Translucent dark slate `#1e293b90` with border `#33415560`
  - Primary Accent: Electric Emerald `#10b981` (Trust, Positive Cash Flow, Growth)
  - Secondary Accent: Cyan / Teal `#06b6d4` (Analytics, Machine Learning)
  - Danger / Alert: Coral Red `#ef4444` (Debt Warnings, Fraud Alerts)
  - Warning: Amber Gold `#f59e0b` (Caution, Moderate Burden)
- **Typography**: Google Fonts (`Inter` for UI clarity and `JetBrains Mono` for currency amounts and code telemetry).
- **Layout Structure**:
  - **Desktop (`> 768px`)**: Fixed left navigation sidebar (`width: 260px`), live backend connectivity badge (`:8000`), main content container offset with `margin-left: 260px` and fluid responsive padding.
  - **Mobile (`<= 768px`)**: Fixed top navigation bar (`56px` height) with brand and hamburger trigger; slide-in animated drawer overlay with auto-closing on route navigation.
- **Zero Tailwind Dependency**: Powered entirely by curated Vanilla CSS in `frontend/src/index.css` to guarantee maximum stability and prevent CSS framework build conflicts.

---

## 8. Codebase Sitemap & File Directory

```text
Hack2Ignite/
├── PROJECT.md                               # This master documentation file
├── README.md                                # Hackathon quick-reference
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   ├── analytics.py                 # Cash flow analytics endpoints
│   │   │   ├── auth.py                      # User registration & login sync
│   │   │   ├── business.py                  # MSME profile management
│   │   │   ├── coach.py                     # AI Copilot chat endpoints
│   │   │   ├── credit.py                    # Alternative Trust Score API
│   │   │   ├── demo.py                      # 1-Click demo data seeding
│   │   │   ├── fraud.py                     # Fraud & velocity surveillance
│   │   │   ├── health.py                    # Health check endpoint
│   │   │   ├── loans.py                     # Loan application & simulator
│   │   │   ├── schemes.py                   # Government scheme discovery
│   │   │   └── transactions.py              # CSV ingestion & ledger query
│   │   ├── core/
│   │   │   ├── config.py                    # Environment settings & Pydantic config
│   │   │   ├── database.py                  # Async SQLAlchemy session factory
│   │   │   ├── dependencies.py              # Auth & database dependency injection
│   │   │   └── firebase_admin.py            # Firebase Admin SDK & token validation
│   │   ├── ml/
│   │   │   ├── credit_scoring.py            # 300-850 Trust Score calculation
│   │   │   ├── feature_engineering.py       # Transaction ratio extractor
│   │   │   ├── fraud_engine.py              # Isolation Forest & velocity rules
│   │   │   └── loan_engine.py               # Underwriting & EMI amortization math
│   │   ├── models/                          # SQLAlchemy ORM models
│   │   │   ├── base.py                      # Declarative base & timestamp mixins
│   │   │   ├── business.py                  # Business profile entity
│   │   │   ├── credit_profile.py            # Computed trust score records
│   │   │   ├── fraud_alert.py               # Detected fraud incidents
│   │   │   ├── government_scheme.py         # Catalog of national schemes
│   │   │   ├── loan.py                      # Loan applications & contracts
│   │   │   ├── scheme_match.py              # MSME scheme match evaluations
│   │   │   ├── transaction.py               # Individual financial records
│   │   │   └── user.py                      # User credentials & Firebase UID
│   │   ├── schemas/                         # Pydantic request/response schemas
│   │   ├── services/                        # Modular business logic services
│   │   └── main.py                          # FastAPI application factory & CORS
│   ├── requirements.txt                     # Python dependencies
│   └── run.py                               # Uvicorn launcher script
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DashboardLayout.tsx          # Responsive desktop/mobile shell
    │   │   └── RouteGuards.tsx              # Protected & Public-Only route guards
    │   ├── lib/
    │   │   ├── api.ts                       # Typed fetch client with error handling
    │   │   ├── auth-context.tsx             # React context for Firebase auth state
    │   │   └── firebase.ts                  # Firebase modular app initialization
    │   ├── pages/
    │   │   ├── AnalyticsPage.tsx            # Inflow/outflow & expense analytics
    │   │   ├── CreditProfilePage.tsx        # Alternative Trust Score & explainability
    │   │   ├── DashboardPage.tsx            # Main MSME intelligence overview
    │   │   ├── FinancialCoachPage.tsx       # Contextual AI Financial Copilot
    │   │   ├── FraudAlertsPage.tsx          # Fraud signals & anomaly feed
    │   │   ├── HomePage.tsx                 # Public marketing & feature landing
    │   │   ├── LoanPage.tsx                 # Formal micro-loan application
    │   │   ├── LoanSimulatorPage.tsx        # Interactive EMI & affordability tool
    │   │   ├── LoginPage.tsx                # Email sign-in & 1-click demo entry
    │   │   ├── NotFoundPage.tsx             # 404 fallback page
    │   │   ├── OnboardingPage.tsx           # Initial business registration
    │   │   ├── RegisterPage.tsx             # Account creation & fallback sync
    │   │   ├── SchemesPage.tsx              # Government scheme matching
    │   │   └── TransactionsPage.tsx         # CSV upload & paginated ledger
    │   ├── App.tsx                          # React Router v6 route configuration
    │   ├── index.css                        # Pure Vanilla CSS design tokens & classes
    │   └── main.tsx                         # React 18 DOM mount point
    ├── package.json                         # Node dependencies & build scripts
    └── vite.config.ts                       # Vite compiler configuration
```

---

## 9. Local Setup, Execution & Verification

### Prerequisites
- **Node.js**: `v20.x` or later (`npm v10+`)
- **Python**: `3.12` or `3.14`
- **Git**

---

### Step 1: Backend Setup
```bash
cd backend

# 1. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate      # Windows (Powershell / CMD)
# source .venv/bin/activate   # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch the FastAPI server with hot reload
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Health check**: Open `http://127.0.0.1:8000/health` (should return `{"status":"ok","service":"finbridge-api"}`).
- **Interactive Swagger Documentation**: Open `http://127.0.0.1:8000/docs`.

---

### Step 2: Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev -- --host 127.0.0.1 --port 3000
```
- **Application URL**: Open `http://127.0.0.1:3000` in any browser.

---

### Step 3: 1-Click Evaluation Flow
1. Navigate to `http://127.0.0.1:3000`.
2. Click **"Launch App"** or navigate to `/login`.
3. Click the **"Try Demo Mode"** button.
4. You will be authenticated immediately as **Shree Digital Solutions**.
5. On the dashboard, click **"Load Demo Data"** to automatically seed 6 months of realistic retail transactions.
6. Explore the full intelligence suite:
   - View cash flow analytics at `/analytics`.
   - Inspect the Trust Score and explainability factors at `/credit-profile`.
   - Review detected anomaly signals at `/fraud-alerts`.
   - Simulate loan repayments against real surplus at `/loan/simulator`.
   - Discover eligible Indian subsidies at `/schemes`.
   - Ask debt and budgeting questions to the AI Copilot at `/financial-coach`.

---

### Step 4: Production Build Verification
To ensure production readiness and zero TypeScript errors:
```bash
cd frontend
npx tsc --noEmit     # Verifies TypeScript types across the entire project (0 errors)
npm run build        # Generates production bundle in frontend/dist (0 errors)
```

---

*Authored by Team RAY for Hack2Ignite 2026. FINBRIDGE — Mathematical Trust for Inclusive Growth.*
