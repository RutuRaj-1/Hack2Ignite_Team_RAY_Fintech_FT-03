"""
FINBRIDGE — Fraud Detection Schemas (Part 04)
Request / response shapes for the FT-02 hybrid risk engine.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import ConfigDict

from app.schemas.common import BaseSchema


# ---------------------------------------------------------------------------
# Rule engine results (internal + returned in alert detail)
# ---------------------------------------------------------------------------


class RuleResult(BaseSchema):
    """Output of a single deterministic rule check."""

    rule_name: str
    triggered: bool
    severity: str   # "LOW" | "MEDIUM" | "HIGH"
    reason: str     # Human-readable explanation


# ---------------------------------------------------------------------------
# Risk assessment (output of FraudEngine.analyze)
# ---------------------------------------------------------------------------


class RiskAssessment(BaseSchema):
    """
    Combined output of the hybrid engine for one transaction.
    rule_score:     weighted rule contribution (0-100)
    if_score:       Isolation Forest anomaly contribution (0-100)
    risk_score:     final = round(rule_score * 0.70 + if_score * 0.30)
    model_type:     "rule_engine" (IF skipped) or "hybrid"
    """
    model_config = ConfigDict(protected_namespaces=())

    risk_score: int                     # 0–100
    risk_level: str                     # "LOW" | "MEDIUM" | "HIGH"
    rule_score: float
    if_score: float
    model_type: str                     # "rule_engine" | "hybrid"
    triggered_rules: list[RuleResult]


# ---------------------------------------------------------------------------
# Transaction summary (embedded inside alert cards)
# ---------------------------------------------------------------------------


class TransactionSummary(BaseSchema):
    """Minimal transaction info shown on fraud alert cards."""

    id: uuid.UUID
    transaction_date: str
    amount: Decimal
    transaction_type: str
    category: str
    merchant: str | None
    description: str | None


# ---------------------------------------------------------------------------
# FraudAlert response
# ---------------------------------------------------------------------------


class FraudAlertResponse(BaseSchema):
    """Single fraud alert row returned from the API."""
    model_config = ConfigDict(protected_namespaces=())

    id: uuid.UUID
    transaction_id: uuid.UUID
    business_id: uuid.UUID
    risk_score: int
    risk_level: str
    detected_reasons: list[RuleResult]
    model_type: str
    status: str
    created_at: datetime
    transaction: TransactionSummary | None = None


class FraudAlertListResponse(BaseSchema):
    """Paginated list of fraud alerts."""

    alerts: list[FraudAlertResponse]
    total: int
    limit: int
    offset: int


# ---------------------------------------------------------------------------
# Fraud summary (aggregate counts)
# ---------------------------------------------------------------------------


class RiskLevelCount(BaseSchema):
    count: int
    percentage: float


class FraudSummaryResponse(BaseSchema):
    """
    Aggregate stats for the /fraud/summary endpoint.
    Consumed by the frontend stats row.
    """

    total_transactions: int
    analyzed_transactions: int
    low_risk: RiskLevelCount
    medium_risk: RiskLevelCount
    high_risk: RiskLevelCount
    open_alerts: int


# ---------------------------------------------------------------------------
# Analyze request
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseSchema):
    """Optional body for POST /fraud/analyze."""

    transaction_ids: list[uuid.UUID] | None = None  # None = analyze all
