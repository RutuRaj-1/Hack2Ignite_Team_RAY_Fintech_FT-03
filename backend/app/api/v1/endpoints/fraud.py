"""
FINBRIDGE — Fraud Detection Endpoints (Part 04)
FT-02: Transaction Risk Intelligence Layer

Routes:
  POST /fraud/analyze          Run hybrid engine on all business transactions
  GET  /fraud/alerts           Paginated fraud alert list
  GET  /fraud/summary          Aggregate risk counts
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.fraud import (
    AnalyzeRequest,
    FraudAlertListResponse,
    FraudSummaryResponse,
)
from app.services.business import BusinessService
from app.services.fraud import FraudService

router = APIRouter(prefix="/fraud", tags=["fraud"])


# ─────────────────────────────────────────────────────────────────────────────
# Shared helper
# ─────────────────────────────────────────────────────────────────────────────

async def _require_business(current_user: User, db: AsyncSession):
    biz_service = BusinessService(db)
    business = await biz_service.get_by_user_id(current_user.id)
    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Please complete onboarding first.",
        )
    return business


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/analyze",
    summary="Run fraud/risk analysis on all transactions",
    description=(
        "Runs the FT-02 hybrid risk engine (rule engine + Isolation Forest) "
        "on every transaction for the authenticated business. "
        "Creates or updates a FraudAlert for each transaction. "
        "Returns a summary of analyzed and risk-leveled counts."
    ),
)
async def run_fraud_analysis(
    _body: AnalyzeRequest | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    business = await _require_business(current_user, db)
    service = FraudService(db)
    counts = await service.analyze_all_transactions(business.id)
    return {
        "success": True,
        "message": "Fraud analysis complete.",
        "analyzed": counts["analyzed"],
        "high": counts.get("high", 0),
        "medium": counts.get("medium", 0),
        "low": counts.get("low", 0),
    }


@router.get(
    "/alerts",
    response_model=FraudAlertListResponse,
    summary="List fraud alerts for the authenticated business",
    description=(
        "Returns paginated fraud alerts sorted by risk score descending. "
        "Optionally filter by risk_level (LOW | MEDIUM | HIGH). "
        "Each alert includes the embedded transaction details."
    ),
)
async def list_fraud_alerts(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    risk_level: str | None = Query(None, description="Filter: LOW | MEDIUM | HIGH"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FraudAlertListResponse:
    business = await _require_business(current_user, db)
    service = FraudService(db)
    return await service.get_alerts(business.id, limit, offset, risk_level)


@router.get(
    "/summary",
    response_model=FraudSummaryResponse,
    summary="Aggregate fraud risk summary",
    description=(
        "Returns total transaction count, number analyzed, and counts + "
        "percentages for LOW / MEDIUM / HIGH risk levels. "
        "Powers the stats row on the /fraud-alerts dashboard."
    ),
)
async def get_fraud_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FraudSummaryResponse:
    business = await _require_business(current_user, db)
    service = FraudService(db)
    return await service.get_summary(business.id)
