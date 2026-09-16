"""
FINBRIDGE — Credit Scoring Schemas (Part 05)
FT-03: Alternative Credit Assessment Engine

Pydantic schemas for the FINBRIDGE Financial Trust Score and behavioral components.
"""

from datetime import datetime
import uuid
from pydantic import BaseModel, Field


class CreditComponentScores(BaseModel):
    """Sub-scores for the 7 component dimensions (0-100 each)."""
    financial_stability: int = Field(..., ge=0, le=100, description="Stability sub-score (25% weight)")
    cash_flow_health: int = Field(..., ge=0, le=100, description="Cash flow sub-score (20% weight)")
    revenue_consistency: int = Field(..., ge=0, le=100, description="Revenue consistency sub-score (15% weight)")
    expense_discipline: int = Field(..., ge=0, le=100, description="Expense discipline sub-score (10% weight)")
    repayment_capacity: int = Field(..., ge=0, le=100, description="Repayment capacity sub-score (15% weight)")
    transaction_behavior: int = Field(..., ge=0, le=100, description="Transaction behavior sub-score (10% weight)")
    fraud_risk: int = Field(..., ge=0, le=100, description="Fraud & risk signals sub-score (5% weight)")


class CreditFactor(BaseModel):
    """Explainable factor backed by an actual calculated financial metric."""
    name: str
    description: str
    metric_name: str
    metric_value: str
    impact: str  # "positive" | "negative"


class CreditMetrics(BaseModel):
    """Deterministic financial telemetry extracted from business records."""
    avg_monthly_revenue: float = 0.0
    avg_monthly_expense: float = 0.0
    net_cash_flow: float = 0.0
    expense_ratio: float = 0.0
    revenue_std: float = 0.0
    cash_flow_volatility: float = 0.0
    transaction_frequency: float = 0.0
    avg_transaction_value: float = 0.0
    revenue_consistency: float = 0.0
    fraud_alert_rate: float = 0.0
    repayment_capacity: float = 0.0
    positive_cash_flow_months_ratio: float = 0.0
    active_months: int = 0
    total_transactions: int = 0
    business_age_years: float = 0.0
    annual_turnover: float = 0.0


class CreditAssessRequest(BaseModel):
    """Optional request payload for manual triggering."""
    recalculate_fraud: bool = Field(
        default=False,
        description="Optionally run fraud analysis before assessing credit score."
    )


class CreditProfileResponse(BaseModel):
    """
    Standard response model for FINBRIDGE Financial Trust Score.
    Matches example schema in FT-03 specification.
    """
    id: uuid.UUID
    business_id: uuid.UUID
    trust_score: int = Field(..., ge=0, le=100, description="Aggregate trust score 0-100")
    components: CreditComponentScores
    positive_factors: list[str]
    negative_factors: list[str]
    detailed_factors: list[CreditFactor] = []
    metrics: CreditMetrics
    disclaimer: str = (
        "FINBRIDGE Hackathon Prototype Financial Trust Score. "
        "Alternative financial-behavior score for demonstration. "
        "Not a regulated credit bureau score or guaranteed lending approval."
    )
    created_at: datetime

    model_config = {"from_attributes": True}
