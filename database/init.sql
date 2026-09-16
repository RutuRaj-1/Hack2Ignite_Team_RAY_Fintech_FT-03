-- ============================================================
-- FINBRIDGE — PostgreSQL Schema (Supabase-compatible)
-- Schema: public (Supabase default)
-- All PKs use UUID for Supabase auth integration.
-- Run this against your PostgreSQL / Supabase instance.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- For fuzzy text search on schemes

-- ────────────────────────────────────────────
-- Users
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255),
    full_name       VARCHAR(255),
    phone           VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ────────────────────────────────────────────
-- Businesses (MSMEs) — FT-03 Core Entity
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.businesses (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    business_name    VARCHAR(255) NOT NULL,
    business_type    VARCHAR(100),
    gstin            VARCHAR(15) UNIQUE,
    pan              VARCHAR(10) UNIQUE,
    annual_turnover  NUMERIC(15, 2),
    kyc_status       VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | submitted | verified | rejected
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_kyc   ON public.businesses(kyc_status);

-- ────────────────────────────────────────────
-- Transactions — FT-05 Analytics + FT-03 Credit
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.transactions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id      UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount           NUMERIC(15, 2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL,  -- credit | debit
    category         VARCHAR(100),          -- salary | rent | inventory | utilities | ...
    description      VARCHAR(500),
    source           VARCHAR(50),           -- upi | bank | cash | neft | imps
    is_flagged       BOOLEAN NOT NULL DEFAULT FALSE,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_business    ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_tx_date        ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_flagged     ON public.transactions(is_flagged) WHERE is_flagged = TRUE;

-- ────────────────────────────────────────────
-- Loans — FT-03 Core
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.loans (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id                 UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount_requested            NUMERIC(15, 2) NOT NULL,
    amount_approved             NUMERIC(15, 2),
    interest_rate               NUMERIC(5, 4),    -- e.g. 0.1200 = 12% p.a.
    tenure_months               INTEGER,
    purpose                     VARCHAR(255),
    status                      VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending | under_review | approved | rejected | disbursed | closed | defaulted
    credit_score_at_application INTEGER,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_business ON public.loans(business_id);
CREATE INDEX IF NOT EXISTS idx_loans_status   ON public.loans(status);

-- ────────────────────────────────────────────
-- Credit Scores — FT-03 ML Output
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.credit_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    score           INTEGER NOT NULL,          -- 300–900
    model_version   VARCHAR(50) NOT NULL,
    score_factors   JSONB,                     -- explainability data
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_business ON public.credit_scores(business_id);
CREATE INDEX IF NOT EXISTS idx_scores_date     ON public.credit_scores(computed_at DESC);

-- ────────────────────────────────────────────
-- Government Schemes — FT-04
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.schemes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    ministry        VARCHAR(255),
    max_loan_amount NUMERIC(15, 2),
    eligibility     JSONB,                     -- structured eligibility criteria
    apply_url       VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schemes_active  ON public.schemes(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_schemes_name    ON public.schemes USING gin(name gin_trgm_ops);

-- ────────────────────────────────────────────
-- Fraud Flags — FT-02
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fraud_flags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    transaction_id  UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    flag_type       VARCHAR(100) NOT NULL,     -- velocity | round_amount | unusual_hour | ...
    severity        VARCHAR(20) NOT NULL,      -- low | medium | high | critical
    description     TEXT,
    is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flags_business  ON public.fraud_flags(business_id);
CREATE INDEX IF NOT EXISTS idx_flags_severity  ON public.fraud_flags(severity);

-- ────────────────────────────────────────────
-- Updated_at trigger function
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'users','businesses','transactions','loans',
        'credit_scores','schemes','fraud_flags'
    ]) LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_updated_at ON public.%I;
             CREATE TRIGGER trg_updated_at
             BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
            t, t
        );
    END LOOP;
END $$;
