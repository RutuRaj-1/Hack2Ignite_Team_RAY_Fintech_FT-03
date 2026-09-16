"""
FINBRIDGE — Financial Coach Schemas (Part 08)
FT-01: Contextual Financial Literacy & AI Coach Schemas.
"""

from typing import Any
from pydantic import BaseModel, Field


class FinancialContext(BaseModel):
    """
    Structured financial context passed to the AI Coach.
    Extracted deterministically from backend analytics, credit, and loan engines.
    The LLM never calculates these metrics itself.
    """
    monthly_revenue: float = Field(default=0.0, description="Average monthly collections")
    monthly_expenses: float = Field(default=0.0, description="Average monthly business outlays")
    net_cash_flow: float = Field(default=0.0, description="Net monthly cash surplus/deficit")
    expense_ratio: float = Field(default=0.0, description="Expenses / Revenue ratio")
    trust_score: int = Field(default=50, description="Financial Trust Score (0-100)")
    fraud_risk: str = Field(default="LOW", description="Risk tier: LOW | MEDIUM | HIGH")
    requested_loan: float = Field(default=0.0, description="Latest requested loan amount")
    estimated_emi: float = Field(default=0.0, description="Calculated monthly installment")
    projected_surplus: float = Field(default=0.0, description="Net cash flow minus EMI")
    repayment_burden_pct: float = Field(default=0.0, description="EMI / Net Cash Flow (%)")
    active_months: int = Field(default=1, description="Months of verifiable records")
    business_name: str | None = Field(default=None, description="MSME business name")
    business_type: str | None = Field(default=None, description="Category / Sector")


class CoachMessage(BaseModel):
    """Single message in a conversational coaching thread."""
    role: str = Field(..., description="'user' | 'assistant' | 'system'")
    content: str = Field(..., description="Message text content")


class CoachQueryRequest(BaseModel):
    """Payload for asking the AI Financial Coach a question."""
    question: str = Field(..., min_length=2, description="User question or query")
    history: list[CoachMessage] = Field(default_factory=list, description="Recent conversation turns")
    context_override: FinancialContext | None = Field(
        default=None, description="Optional manual context override for simulation"
    )


class CoachQueryResponse(BaseModel):
    """Explainable response returned by the AI Financial Coach."""
    answer: str
    context_used: FinancialContext
    suggested_questions: list[str] = Field(default_factory=list)
    relevant_topic: str | None = None
    provider_used: str = Field(default="fallback", description="Provider used: ollama | fallback | etc.")
    disclaimer: str = (
        "Based on the available prototype data. "
        "The FINBRIDGE AI Coach provides educational and financial guidance for demonstration. "
        "It does not guarantee credit approval, disburse loans, or issue official underwriting sanctions."
    )


class EducationalCard(BaseModel):
    """Contextual educational lesson card for financial literacy."""
    id: str
    topic: str
    title: str
    summary: str
    detailed_explanation: str
    practical_tip: str
    example_formula: str | None = None
    sample_question: str


class EducationalCardsResponse(BaseModel):
    cards: list[EducationalCard]


class ExplainFraudRequest(BaseModel):
    transaction_id: str | None = None
    amount: float = 0.0
    category: str | None = None
    merchant: str | None = None
    risk_level: str = "MEDIUM"
    risk_score: int = 50
    detected_reasons: list[str] = Field(default_factory=list)


class ExplainFraudResponse(BaseModel):
    explanation: str
    recommendation: str
    risk_level: str


class ExplainSchemeRequest(BaseModel):
    scheme_name: str
    scheme_code: str
    match_score: int = 75
    benefits: str = ""
    eligibility_notes: str = ""


class ExplainSchemeResponse(BaseModel):
    summary: str
    why_it_matches: str
    next_steps: list[str]
