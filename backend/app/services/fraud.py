"""
FINBRIDGE — Fraud Detection Service (Part 04)
FT-02: Orchestrates the hybrid fraud engine against the DB.

Key operations:
  analyze_all_transactions  — batch-analyze every transaction for a business
  get_alerts                — paginated FraudAlert list with embedded txn info
  get_summary               — aggregate counts by risk level
"""

import json
import uuid
from dataclasses import asdict
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ml.fraud_engine import (
    FraudEngine,
    TxnContext,
)
from app.models.fraud_alert import FraudAlert
from app.models.transaction import Transaction
from app.schemas.fraud import (
    FraudAlertListResponse,
    FraudAlertResponse,
    FraudSummaryResponse,
    RiskLevelCount,
    RuleResult,
    TransactionSummary,
)
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.fraud")


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _txn_to_context(txn: Transaction) -> TxnContext:
    """Convert an ORM Transaction to an engine TxnContext."""
    return TxnContext(
        transaction_id=str(txn.id),
        amount=txn.amount,
        transaction_type=txn.transaction_type,
        transaction_date=txn.transaction_date,
        merchant=txn.merchant,
        description=txn.description,
        timestamp=txn.timestamp,
    )


def _rule_result_to_dict(r: "RuleResult") -> dict:
    return {
        "rule_name": r.rule_name,
        "triggered": r.triggered,
        "severity": r.severity,
        "reason": r.reason,
    }


def _alert_to_response(alert: FraudAlert) -> FraudAlertResponse:
    """Convert a FraudAlert ORM row to its API response schema."""
    reasons_raw = json.loads(alert.detected_reasons or "[]")
    reasons = [RuleResult(**r) for r in reasons_raw]

    txn_summary = None
    if alert.transaction:
        txn = alert.transaction
        txn_summary = TransactionSummary(
            id=txn.id,
            transaction_date=str(txn.transaction_date),
            amount=txn.amount,
            transaction_type=txn.transaction_type,
            category=txn.category,
            merchant=txn.merchant,
            description=txn.description,
        )

    return FraudAlertResponse(
        id=alert.id,
        transaction_id=alert.transaction_id,
        business_id=alert.business_id,
        risk_score=alert.risk_score,
        risk_level=alert.risk_level,
        detected_reasons=reasons,
        model_type=alert.model_type,
        status=alert.status,
        created_at=alert.created_at,
        transaction=txn_summary,
    )


# ─────────────────────────────────────────────────────────────────────────────
# FraudService
# ─────────────────────────────────────────────────────────────────────────────

class FraudService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def analyze_all_transactions(
        self, business_id: uuid.UUID
    ) -> dict:
        """
        Batch-analyze all transactions for a business.
        For each transaction, run the hybrid engine and upsert a FraudAlert.
        Returns a summary dict with counts.
        """
        # ── 1. Load all transactions ────────────────────────────────────────
        stmt = (
            select(Transaction)
            .where(Transaction.business_id == business_id)
            .order_by(Transaction.transaction_date.asc())
        )
        result = await self.db.execute(stmt)
        transactions: list[Transaction] = list(result.scalars().all())

        if not transactions:
            return {"analyzed": 0, "high": 0, "medium": 0, "low": 0}

        # ── 2. Build engine + history context ──────────────────────────────
        history_ctxs = [_txn_to_context(t) for t in transactions]
        engine = FraudEngine()
        engine.train(history_ctxs)
        history_ctx = FraudEngine.build_history_context(history_ctxs)

        # ── 3. Load existing alerts (for upsert) ───────────────────────────
        existing_stmt = select(FraudAlert).where(
            FraudAlert.business_id == business_id
        )
        existing_result = await self.db.execute(existing_stmt)
        existing_map: dict[uuid.UUID, FraudAlert] = {
            a.transaction_id: a
            for a in existing_result.scalars().all()
        }

        counts = {"analyzed": 0, "high": 0, "medium": 0, "low": 0}

        # ── 4. Analyze each transaction ────────────────────────────────────
        for txn in transactions:
            ctx = _txn_to_context(txn)
            assessment = engine.analyze(ctx, history_ctx, history_ctxs)

            reasons_json = json.dumps(
                [_rule_result_to_dict(r) for r in assessment.triggered_rules]
            )

            if txn.id in existing_map:
                # Update existing alert
                alert = existing_map[txn.id]
                alert.risk_score = assessment.risk_score
                alert.risk_level = assessment.risk_level
                alert.detected_reasons = reasons_json
                alert.model_type = assessment.model_type
            else:
                # Create new alert
                alert = FraudAlert(
                    transaction_id=txn.id,
                    business_id=business_id,
                    risk_score=assessment.risk_score,
                    risk_level=assessment.risk_level,
                    detected_reasons=reasons_json,
                    model_type=assessment.model_type,
                    status="open",
                )
                self.db.add(alert)

            counts["analyzed"] += 1
            level_key = assessment.risk_level.lower()
            counts[level_key] = counts.get(level_key, 0) + 1

        await self.db.commit()
        logger.info(
            "Fraud analysis complete",
            business_id=str(business_id),
            **counts,
        )
        return counts

    async def get_alerts(
        self,
        business_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
        risk_level: str | None = None,
    ) -> FraudAlertListResponse:
        """Return paginated fraud alerts with embedded transaction info."""
        base = (
            select(FraudAlert)
            .where(FraudAlert.business_id == business_id)
            .options(selectinload(FraudAlert.transaction))
        )
        if risk_level:
            base = base.where(FraudAlert.risk_level == risk_level.upper())

        # Total count
        count_stmt = select(func.count()).select_from(base.subquery())
        total = (await self.db.execute(count_stmt)).scalar_one()

        # Paginated results — high risk first, then by score desc
        stmt = (
            base
            .order_by(FraudAlert.risk_score.desc(), FraudAlert.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        alerts = list(result.scalars().all())

        return FraudAlertListResponse(
            alerts=[_alert_to_response(a) for a in alerts],
            total=total,
            limit=limit,
            offset=offset,
        )

    async def get_summary(self, business_id: uuid.UUID) -> FraudSummaryResponse:
        """Return aggregate risk-level counts for a business."""
        # Total transactions
        txn_count_stmt = select(func.count()).select_from(
            select(Transaction).where(
                Transaction.business_id == business_id
            ).subquery()
        )
        total_txns = (await self.db.execute(txn_count_stmt)).scalar_one()

        # Alert counts by risk level
        alerts_stmt = select(FraudAlert).where(
            FraudAlert.business_id == business_id
        )
        result = await self.db.execute(alerts_stmt)
        all_alerts = list(result.scalars().all())

        analyzed = len(all_alerts)
        low = sum(1 for a in all_alerts if a.risk_level == "LOW")
        medium = sum(1 for a in all_alerts if a.risk_level == "MEDIUM")
        high = sum(1 for a in all_alerts if a.risk_level == "HIGH")
        open_alerts = sum(1 for a in all_alerts if a.status == "open")

        def pct(n: int) -> float:
            return round(n / analyzed * 100, 1) if analyzed > 0 else 0.0

        return FraudSummaryResponse(
            total_transactions=total_txns,
            analyzed_transactions=analyzed,
            low_risk=RiskLevelCount(count=low, percentage=pct(low)),
            medium_risk=RiskLevelCount(count=medium, percentage=pct(medium)),
            high_risk=RiskLevelCount(count=high, percentage=pct(high)),
            open_alerts=open_alerts,
        )
