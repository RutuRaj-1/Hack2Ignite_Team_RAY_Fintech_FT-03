"""
FINBRIDGE — Government Schemes Endpoints (Part 07)
FT-04: Financing Opportunity Layer
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.scheme import GovernmentSchemeResponse, MatchingResult
from app.services.business import BusinessService
from app.services.scheme_matching import SchemeMatchingEngine

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get(
    "",
    response_model=list[GovernmentSchemeResponse],
    summary="List all active government schemes",
)
async def list_schemes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns a catalog of all active government schemes."""
    engine = SchemeMatchingEngine(db)
    schemes = await engine.get_all_schemes()
    return schemes


@router.get(
    "/matches",
    response_model=MatchingResult,
    summary="Get scheme matches for the user's business",
    description="Runs the fuzzy matching engine against the user's MSME profile and returns prioritized recommendations.",
)
async def get_scheme_matches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates the business profile against eligibility criteria for all active schemes.
    """
    biz_service = BusinessService(db)
    business = await biz_service.get_by_user_id(current_user.id)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Please complete onboarding first.",
        )

    engine = SchemeMatchingEngine(db)
    matches = await engine.match_schemes_for_business(business.id)

    return MatchingResult(
        business_id=business.id,
        total_matches=len(matches),
        matches=matches,
    )
