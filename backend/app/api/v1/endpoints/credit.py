"""
FINBRIDGE — Credit Module Router (Part 05)
FT-03: Core Alternative Credit Assessment Engine
Produces the FINBRIDGE FINANCIAL TRUST SCORE (0-100) and explainable factors.

Routes:
  POST /api/v1/credit/assess     Calculate and store new Financial Trust Score
  GET  /api/v1/credit/profile    Get latest credit profile & score explanation
  GET  /api/v1/credit/score/{business_id}  Get latest score for a specific business
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.credit import (
    CreditAssessRequest,
    CreditProfileResponse,
)
from app.services.business import BusinessService
from app.services.credit import CreditService

router = APIRouter(prefix="/credit", tags=["credit"])


# ─────────────────────────────────────────────────────────────────────────────
# Helper
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
    "/assess",
    response_model=CreditProfileResponse,
    summary="Assess business credit & generate Financial Trust Score",
    description=(
        "Executes the FT-03 Alternative Credit Assessment Engine. "
        "Extracts deterministic features across stability, cash flow, consistency, "
        "expense discipline, repayment capacity, transaction behaviour, and fraud signals. "
        "Returns explainable 0-100 Financial Trust Score with metric-backed factors."
    ),
)
async def assess_credit_score(
    body: CreditAssessRequest | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CreditProfileResponse:
    business = await _require_business(current_user, db)
    service = CreditService(db)
    recalc_fraud = body.recalculate_fraud if body else False
    return await service.assess_credit(business.id, recalculate_fraud=recalc_fraud)


@router.get(
    "/profile",
    response_model=CreditProfileResponse,
    summary="Get current Financial Trust Score & Credit Profile",
    description=(
        "Retrieves the latest Financial Trust Profile for the authenticated business. "
        "If no assessment exists yet, automatically performs an initial assessment."
    ),
)
async def get_credit_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CreditProfileResponse:
    business = await _require_business(current_user, db)
    service = CreditService(db)
    profile = await service.get_latest_profile(business.id, auto_assess_if_missing=True)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit profile could not be generated.",
        )
    return profile


@router.get(
    "/score/{business_id}",
    response_model=CreditProfileResponse,
    summary="Get credit score by business ID",
    description="Fetches latest credit score profile for the given business ID.",
)
async def get_credit_score_by_id(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CreditProfileResponse:
    service = CreditService(db)
    profile = await service.get_latest_profile(business_id, auto_assess_if_missing=True)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No credit profile found for business {business_id}.",
        )
    return profile
