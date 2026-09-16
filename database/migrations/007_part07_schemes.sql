-- ============================================================
-- FINBRIDGE — Migration: Part 07 Government Schemes
-- FT-04: Financing Opportunity Layer
-- Run after 006_part06_loans.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.government_schemes (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(255) NOT NULL,
    description         TEXT        NOT NULL,
    business_type       JSONB       NOT NULL DEFAULT '["ALL"]',
    minimum_turnover    NUMERIC(15, 2),
    maximum_turnover    NUMERIC(15, 2),
    eligible_locations  JSONB       NOT NULL DEFAULT '["ALL"]',
    eligibility_rules   JSONB       NOT NULL DEFAULT '[]',
    source_url          VARCHAR(500) NOT NULL,
    verification_status VARCHAR(50)  NOT NULL DEFAULT 'Verified',
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_government_schemes_name ON public.government_schemes(name);

CREATE TABLE IF NOT EXISTS public.scheme_matches (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id         UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    scheme_id           UUID        NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
    match_percentage    INTEGER     NOT NULL DEFAULT 0 CHECK (match_percentage BETWEEN 0 AND 100),
    matched_conditions  JSONB       NOT NULL DEFAULT '[]',
    unmet_conditions    JSONB       NOT NULL DEFAULT '[]',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheme_matches_business ON public.scheme_matches(business_id);
CREATE INDEX IF NOT EXISTS idx_scheme_matches_business_scheme ON public.scheme_matches(business_id, scheme_id);

-- ============================================================
-- SEED DATA (Verified Official Schemes)
-- ============================================================

INSERT INTO public.government_schemes 
(name, description, business_type, minimum_turnover, maximum_turnover, eligible_locations, eligibility_rules, source_url, verification_status) 
VALUES 
(
    'Prime Minister''s Employment Generation Programme (PMEGP)',
    'A credit-linked subsidy scheme by the Ministry of MSME to promote self-employment through setting up micro-enterprises in the non-farm sector. Margin money subsidy up to 35% is provided.',
    '["Manufacturing", "Services", "Trading", "ALL"]',
    NULL,
    NULL,
    '["Urban", "Rural", "ALL"]',
    '["Age >= 18", "Project cost up to 50 Lakh (Mfg) / 20 Lakh (Service)", "Minimum 8th pass for projects above certain cost"]',
    'https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp',
    'Verified'
),
(
    'Pradhan Mantri MUDRA Yojana (PMMY) - Tarun',
    'Provides loans from ₹5 Lakh up to ₹10 Lakh to micro and small enterprises for income-generating activities in manufacturing, trading, and services.',
    '["Manufacturing", "Services", "Trading", "ALL"]',
    NULL,
    NULL,
    '["Urban", "Rural", "ALL"]',
    '["Non-Corporate Small Business Segment (NCSBS)", "Running business with track record", "Must not be a defaulter to any bank"]',
    'https://www.mudra.org.in/',
    'Verified'
),
(
    'PM Street Vendor''s AtmaNirbhar Nidhi (PM SVANidhi)',
    'A special micro-credit facility providing affordable collateral-free loans up to ₹50,000 to street vendors to resume their livelihoods.',
    '["Street Vendor", "Trading", "Retail"]',
    NULL,
    120000.00,
    '["Urban", "Semi-Urban"]',
    '["Must be a street vendor operating on or before March 24, 2020", "Certificate of Vending / ID card required"]',
    'https://pmsvanidhi.mohua.gov.in/',
    'Verified'
),
(
    'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    'Provides collateral-free credit (up to ₹5 Crore) to MSMEs by offering a credit guarantee to lending institutions.',
    '["Manufacturing", "Services", "Trading"]',
    NULL,
    500000000.00,
    '["Urban", "Rural", "ALL"]',
    '["Must be a new or existing Micro/Small Enterprise", "Retail trade is eligible but with specific caps", "Educational/Training institutions eligible"]',
    'https://www.cgtmse.in/',
    'Verified'
),
(
    'Stand-Up India Scheme',
    'Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC or ST borrower, and at least one women borrower, per bank branch for setting up a greenfield enterprise.',
    '["Manufacturing", "Services", "Trading"]',
    NULL,
    NULL,
    '["Urban", "Rural", "ALL"]',
    '["SC/ST and/or Women Entrepreneur", "Age >= 18", "Greenfield enterprise only (first time venture)", "Not in default to any bank"]',
    'https://www.standupmitra.in/',
    'Verified'
);
