-- ============================================================
-- FINBRIDGE — Migration: Part 04 FraudAlert Table
-- FT-02: Transaction Risk Intelligence Layer
-- Run after 003_part03_transactions.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id      UUID        NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    business_id         UUID        NOT NULL REFERENCES public.businesses(id)   ON DELETE CASCADE,
    risk_score          INTEGER     NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    risk_level          VARCHAR(10) NOT NULL DEFAULT 'LOW'
                                    CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    detected_reasons    TEXT        NOT NULL DEFAULT '[]',   -- JSON list of rule results
    model_type          VARCHAR(20) NOT NULL DEFAULT 'rule_engine'
                                    CHECK (model_type IN ('rule_engine', 'hybrid')),
    status              VARCHAR(20) NOT NULL DEFAULT 'open'
                                    CHECK (status IN ('open', 'reviewed', 'dismissed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_fraud_business_created
    ON public.fraud_alerts(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fraud_transaction
    ON public.fraud_alerts(transaction_id);

CREATE INDEX IF NOT EXISTS idx_fraud_level_status
    ON public.fraud_alerts(risk_level, status);

CREATE INDEX IF NOT EXISTS idx_fraud_risk_score
    ON public.fraud_alerts(business_id, risk_score DESC);
