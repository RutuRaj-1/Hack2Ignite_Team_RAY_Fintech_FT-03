"""
FINBRIDGE — API v1 Central Router
Aggregates all module routers under /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    auth,
    business,
    coach,
    credit,
    fraud,
    health,
    loans,
    schemes,
    transactions,
    demo,
)

api_router = APIRouter(prefix="/api/v1")

# --- Core ---
api_router.include_router(health.router)

# --- Auth ---
api_router.include_router(auth.router)

# --- FT-03: Micro-Lending Core ---
api_router.include_router(business.router)
api_router.include_router(loans.router)
api_router.include_router(credit.router)

# --- FT-05: MSME Expense Analytics ---
api_router.include_router(transactions.router)
api_router.include_router(analytics.router)

# --- FT-02: Fraud Detection ---
api_router.include_router(fraud.router)

# --- FT-04: Government Scheme Discovery ---
api_router.include_router(schemes.router)

# --- FT-01: Financial Literacy / AI Coach ---
api_router.include_router(coach.router)

# --- Demo Seed ---
api_router.include_router(demo.router)
