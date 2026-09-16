"""
FINBRIDGE — Loans Module Router (Part 06)
FT-03: Core Micro-Lending Underwriting, Assessment & Simulation Layer.

Routes:
  POST /api/v1/loans/apply                  Submit loan application
  POST /api/v1/loans/assess                 Evaluate loan request & generate offer
  POST /api/v1/loans/simulate               General dynamic repayment simulator
  POST /api/v1/loans/{application_id}/simulate  Simulate variations for a specific application
  GET  /api/v1/loans/applications           List loan applications for current business
  GET  /api/v1/loans/{application_id}       Get loan application details & offers
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.loan import (
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoanAssessmentRequest,
    LoanAssessmentResponse,
    LoanSimulationRequest,
    LoanSimulationResponse,
)
from app.services.business import BusinessService
from app.services.loan import LoanService

router = APIRouter(prefix="/loans", tags=["loans"])


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
    "/apply",
    response_model=LoanApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a loan application",
    description="Submits a borrowing request for the authenticated MSME business.",
)
async def apply_for_loan(
    body: LoanApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LoanApplicationResponse:
    business = await _require_business(current_user, db)
    service = LoanService(db)
    return await service.apply_for_loan(business.id, body)


@router.post(
    "/assess",
    response_model=LoanAssessmentResponse,
    summary="Assess loan request and produce prototype recommendation",
    description=(
        "Evaluates borrowing parameters against the MSME's Financial Trust Score, "
        "net cash flow, expense discipline, and fraud telemetry. "
        "Returns sustainable loan bounds, reducing-balance EMI, repayment burden, "
        "and over-borrowing cautions."
    ),
)
async def assess_loan(
    body: LoanAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LoanAssessmentResponse:
    business = await _require_business(current_user, db)
    service = LoanService(db)
    return await service.assess_loan(
        business_id=business.id,
        application_id=body.application_id,
        requested_amount=body.requested_amount,
        tenure_months=body.tenure_months,
        purpose=body.purpose,
    )


@router.post(
    "/simulate",
    response_model=LoanSimulationResponse,
    summary="Dynamic loan repayment simulator",
    description=(
        "Simulates loan parameters (amount, tenure, interest rate) in real-time "
        "against the business's actual cash flow surplus. "
        "Calculates EMI, repayment burden %, and over-borrowing risk."
    ),
)
async def simulate_repayment(
    body: LoanSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LoanSimulationResponse:
    business = await _require_business(current_user, db)
    service = LoanService(db)
    return await service.simulate_loan(
        business_id=business.id,
        loan_amount=body.loan_amount,
        tenure_months=body.tenure_months,
        annual_interest_rate=body.annual_interest_rate,
    )


@router.post(
    "/{application_id}/simulate",
    response_model=LoanSimulationResponse,
    summary="Simulate parameters for a specific loan application",
)
async def simulate_application(
    application_id: uuid.UUID,
    body: LoanSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LoanSimulationResponse:
    business = await _require_business(current_user, db)
    service = LoanService(db)
    return await service.simulate_loan(
        business_id=business.id,
        loan_amount=body.loan_amount,
        tenure_months=body.tenure_months,
        annual_interest_rate=body.annual_interest_rate,
    )


@router.get(
    "/applications",
    response_model=list[LoanApplicationResponse],
    summary="List loan applications for current business",
)
async def list_loan_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[LoanApplicationResponse]:
    business = await _require_business(current_user, db)
    service = LoanService(db)
    return await service.list_applications(business.id)


@router.get(
    "/{application_id}",
    response_model=LoanApplicationResponse,
    summary="Get loan application by ID",
)
async def get_loan_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LoanApplicationResponse:
    business = await _require_business(current_user, db)
    service = LoanService(db)
    app = await service.get_application(business.id, application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application {application_id} not found.",
        )
    return app
