-- ============================================================
-- FINBRIDGE — Migration: Part 05 CreditProfile Table
-- FT-03: Alternative Credit Assessment Engine
-- Run after 004_part04_fraud_alerts.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.credit_profiles (
    id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id                 UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    cash_flow_score             INTEGER     NOT NULL DEFAULT 0 CHECK (cash_flow_score BETWEEN 0 AND 100),
    stability_score             INTEGER     NOT NULL DEFAULT 0 CHECK (stability_score BETWEEN 0 AND 100),
    revenue_consistency_score   INTEGER     NOT NULL DEFAULT 0 CHECK (revenue_consistency_score BETWEEN 0 AND 100),
    expense_discipline_score    INTEGER     NOT NULL DEFAULT 0 CHECK (expense_discipline_score BETWEEN 0 AND 100),
    repayment_capacity_score    INTEGER     NOT NULL DEFAULT 0 CHECK (repayment_capacity_score BETWEEN 0 AND 100),
    transaction_behavior_score  INTEGER     NOT NULL DEFAULT 0 CHECK (transaction_behavior_score BETWEEN 0 AND 100),
    fraud_risk_score            INTEGER     NOT NULL DEFAULT 0 CHECK (fraud_risk_score BETWEEN 0 AND 100),
    trust_score                 INTEGER     NOT NULL DEFAULT 0 CHECK (trust_score BETWEEN 0 AND 100),
    explanation                 TEXT        NOT NULL DEFAULT '{}',   -- JSON payload containing factors & metrics
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookup of latest credit assessment per business
CREATE INDEX IF NOT EXISTS idx_credit_business_created
    ON public.credit_profiles(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_trust_score
    ON public.credit_profiles(trust_score DESC);
