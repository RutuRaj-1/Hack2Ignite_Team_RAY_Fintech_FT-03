"""
FINBRIDGE — Loan Schemas (Part 06)
FT-03: Core Micro-Lending Schemas for Application, Assessment & Simulation.
"""

from datetime import datetime
import uuid
from pydantic import BaseModel, Field


class LoanApplicationCreate(BaseModel):
    """Payload for submitting a new loan application."""
    requested_amount: float = Field(
        ..., gt=0, description="Requested principal amount in INR (> 0)"
    )
    tenure_months: int = Field(
        ..., ge=1, le=60, description="Repayment tenure in months (1 to 60)"
    )
    purpose: str = Field(
        ..., min_length=3, max_length=255, description="Business borrowing purpose"
    )


class LoanOfferResponse(BaseModel):
    """Persisted prototype loan recommendation offer."""
    id: uuid.UUID
    loan_application_id: uuid.UUID
    recommended_min_amount: float
    recommended_max_amount: float
    estimated_emi: float
    estimated_interest: float
    risk_level: str
    explanation: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class LoanApplicationResponse(BaseModel):
    """Loan application with optional attached offers."""
    id: uuid.UUID
    business_id: uuid.UUID
    requested_amount: float
    tenure_months: int
    purpose: str
    status: str
    created_at: datetime
    offers: list[LoanOfferResponse] = []

    model_config = {"from_attributes": True}


class LoanAssessmentRequest(BaseModel):
    """Request payload for assessing a loan application or standalone scenario."""
    application_id: uuid.UUID | None = Field(
        default=None, description="Existing LoanApplication ID to evaluate"
    )
    requested_amount: float | None = Field(
        default=None, gt=0, description="Optional override for requested amount"
    )
    tenure_months: int | None = Field(
        default=None, ge=1, le=60, description="Optional override for tenure"
    )
    purpose: str | None = Field(
        default=None, description="Optional borrowing purpose"
    )


class LoanAssessmentResponse(BaseModel):
    """
    Explainable prototype loan assessment response.
    Never returns generic 'Approved' — provides explainable prototype recommendations.
    """
    application_id: uuid.UUID | None = None
    offer_id: uuid.UUID | None = None
    recommended_min_amount: float
    recommended_max_amount: float
    requested_amount: float
    tenure_months: int
    annual_interest_rate: float
    estimated_emi: float
    estimated_interest: float
    total_repayment: float
    risk_level: str
    current_monthly_cash_flow: float
    post_loan_projected_surplus: float
    repayment_burden_pct: float
    is_overborrowing_risk: bool
    prototype_recommendation: str
    supporting_factors: list[str]
    caution_factors: list[str]
    disclaimer: str = (
        "FINBRIDGE Prototype Underwriting Recommendation. "
        "Alternative credit assessment for demonstration purposes. "
        "Not a regulated lending sanction or guarantee of NBFC/Bank disbursement."
    )


class LoanSimulationRequest(BaseModel):
    """Request payload for real-time dynamic loan simulation."""
    loan_amount: float = Field(
        ..., gt=0, description="Simulated loan principal in INR"
    )
    tenure_months: int = Field(
        ..., ge=1, le=60, description="Simulated repayment tenure in months"
    )
    annual_interest_rate: float | None = Field(
        default=None, ge=0.0, le=50.0, description="Optional custom annual interest rate"
    )


class LoanSimulationResponse(BaseModel):
    """Dynamic response for loan simulator sliders and widgets."""
    loan_amount: float
    tenure_months: int
    annual_interest_rate: float
    emi: float
    total_interest: float
    total_repayment: float
    current_cash_flow: float
    post_loan_cash_flow: float
    repayment_burden_pct: float
    is_overborrowing_risk: bool
    risk_level: str
    cautions: list[str] = []
