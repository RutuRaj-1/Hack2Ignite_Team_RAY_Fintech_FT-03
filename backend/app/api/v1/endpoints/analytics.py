"""
FINBRIDGE — Analytics Endpoints (Part 03)
GET /analytics/summary       — FinancialSummary (6+ metrics)
GET /analytics/cashflow      — Monthly credit / debit / net time series
GET /analytics/expenses      — Per-category expense breakdown
GET /analytics/revenue-trend — Monthly revenue trend

All endpoints are auth-gated.
Business is resolved from the authenticated user (no business_id in path).
All calculations are backend-only; the frontend only renders.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    CashflowResponse,
    ExpensesResponse,
    FinancialSummary,
    RevenueTrendResponse,
)
from app.services.analytics import AnalyticsService
from app.services.business import BusinessService

router = APIRouter(prefix="/analytics", tags=["analytics"])


async def _require_business(current_user: User, db: AsyncSession):
    """Resolve the business for the current user or raise 404."""
    biz_service = BusinessService(db)
    business = await biz_service.get_by_user_id(current_user.id)
    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Please complete onboarding first.",
        )
    return business


@router.get(
    "/summary",
    response_model=FinancialSummary,
    summary="Financial health summary",
    description=(
        "Returns aggregated financial metrics: monthly revenue, expenses, "
        "net cash flow, expense ratio, revenue consistency, and cash-flow volatility. "
        "All values computed server-side."
    ),
)
async def get_financial_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FinancialSummary:
    business = await _require_business(current_user, db)
    service = AnalyticsService(db)
    return await service.get_summary(business.id)


@router.get(
    "/cashflow",
    response_model=CashflowResponse,
    summary="Monthly cash-flow trend",
    description="Returns month-by-month credit, debit, and net values.",
)
async def get_cashflow(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CashflowResponse:
    business = await _require_business(current_user, db)
    service = AnalyticsService(db)
    return await service.get_cashflow(business.id)


@router.get(
    "/expenses",
    response_model=ExpensesResponse,
    summary="Expense breakdown by category",
    description="Returns per-category expense totals and percentage share of total spend.",
)
async def get_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExpensesResponse:
    business = await _require_business(current_user, db)
    service = AnalyticsService(db)
    return await service.get_expenses(business.id)


@router.get(
    "/revenue-trend",
    response_model=RevenueTrendResponse,
    summary="Monthly revenue trend",
    description="Returns per-month revenue aggregates for the revenue trend chart.",
)
async def get_revenue_trend(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RevenueTrendResponse:
    business = await _require_business(current_user, db)
    service = AnalyticsService(db)
    return await service.get_revenue_trend(business.id)
