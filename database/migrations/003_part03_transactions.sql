-- ============================================================
-- FINBRIDGE — Migration: Part 03 Transaction Model
-- Drops and recreates the transactions table with the full
-- Part 03 schema: transaction_date (DATE), merchant, timestamp.
-- Run this after Part 02 baseline schema is applied.
-- ============================================================

-- Drop old stub table (safe in dev; production: use ALTER TABLE)
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Full Part 03 transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id       UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    transaction_date  DATE        NOT NULL,
    amount            NUMERIC(15, 2) NOT NULL,
    transaction_type  VARCHAR(10) NOT NULL,   -- 'credit' | 'debit'
    category          VARCHAR(100) NOT NULL DEFAULT 'Miscellaneous',
    merchant          VARCHAR(255),
    description       VARCHAR(500),
    timestamp         TIMESTAMPTZ,            -- Optional precise datetime
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_tx_business_id    ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_tx_date           ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_type           ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_tx_category       ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_tx_business_date  ON public.transactions(business_id, transaction_date DESC);
