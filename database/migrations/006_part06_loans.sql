-- ============================================================
-- FINBRIDGE — Migration: Part 06 Loan Tables
-- FT-03: Micro-Lending Assessment & Repayment Layer
-- Run after 005_part05_credit_profiles.sql
-- ============================================================

-- 1. Loan Applications
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id         UUID            NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    requested_amount    NUMERIC(15, 2)  NOT NULL CHECK (requested_amount > 0),
    tenure_months       INTEGER         NOT NULL CHECK (tenure_months BETWEEN 1 AND 60),
    purpose             VARCHAR(255)    NOT NULL,
    status              VARCHAR(50)     NOT NULL DEFAULT 'draft'
                                        CHECK (status IN ('draft', 'assessed', 'offered', 'accepted', 'rejected', 'completed')),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_apps_business_created
    ON public.loan_applications(business_id, created_at DESC);

-- 2. Loan Offers
CREATE TABLE IF NOT EXISTS public.loan_offers (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_application_id     UUID            NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    recommended_min_amount  NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    recommended_max_amount  NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    estimated_emi           NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    estimated_interest      NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    risk_level              VARCHAR(20)     NOT NULL DEFAULT 'MEDIUM'
                                            CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    explanation             TEXT            NOT NULL DEFAULT '{}',   -- JSON payload with factors & burden metrics
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_offers_app_created
    ON public.loan_offers(loan_application_id, created_at DESC);

-- 3. Repayments
CREATE TABLE IF NOT EXISTS public.repayments (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_offer_id   UUID            NOT NULL REFERENCES public.loan_offers(id) ON DELETE CASCADE,
    due_date        DATE            NOT NULL,
    amount          NUMERIC(15, 2)  NOT NULL CHECK (amount >= 0),
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'paid', 'overdue')),
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repayments_offer_due
    ON public.repayments(loan_offer_id, due_date ASC);
