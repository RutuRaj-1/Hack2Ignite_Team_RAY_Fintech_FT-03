"""
FINBRIDGE — Credit Scoring Service (Part 05)
FT-03: Orchestrates feature engineering, ML credit scoring, and profile persistence.
"""

from dataclasses import asdict
import json
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.credit_scoring import CreditScoreResult, CreditScoringEngine
from app.ml.feature_engineering import extract_credit_features
from app.models.business import Business
from app.models.credit_profile import CreditProfile
from app.models.fraud_alert import FraudAlert
from app.models.transaction import Transaction
from app.schemas.credit import (
    CreditComponentScores,
    CreditFactor,
    CreditMetrics,
    CreditProfileResponse,
)
from app.services.fraud import FraudService
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.credit")


def _profile_to_response(profile: CreditProfile) -> CreditProfileResponse:
    """Converts a CreditProfile ORM row to its API response schema."""
    explanation_dict = {}
    try:
        explanation_dict = json.loads(profile.explanation or "{}")
    except Exception as e:
        logger.warning("Failed to decode credit profile explanation: %s", e)

    components = CreditComponentScores(
        financial_stability=profile.stability_score,
        cash_flow_health=profile.cash_flow_score,
        revenue_consistency=profile.revenue_consistency_score,
        expense_discipline=profile.expense_discipline_score,
        repayment_capacity=profile.repayment_capacity_score,
        transaction_behavior=profile.transaction_behavior_score,
        fraud_risk=profile.fraud_risk_score,
    )

    positive_factors = explanation_dict.get("positive_factors", [])
    negative_factors = explanation_dict.get("negative_factors", [])
    detailed_raw = explanation_dict.get("detailed_factors", [])
    detailed_factors = [CreditFactor(**f) for f in detailed_raw if isinstance(f, dict)]

    metrics_raw = explanation_dict.get("metrics", {})
    metrics = CreditMetrics(**metrics_raw) if metrics_raw else CreditMetrics()

    return CreditProfileResponse(
        id=profile.id,
        business_id=profile.business_id,
        trust_score=profile.trust_score,
        components=components,
        positive_factors=positive_factors,
        negative_factors=negative_factors,
        detailed_factors=detailed_factors,
        metrics=metrics,
        created_at=profile.created_at,
    )


class CreditService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = CreditScoringEngine()

    async def assess_credit(
        self, business_id: uuid.UUID, recalculate_fraud: bool = False
    ) -> CreditProfileResponse:
        """
        Gathers business data, transactions, and fraud signals;
        executes feature extraction and deterministic scoring;
        persists the resulting CreditProfile; and returns the response.
        """
        # 1. Fetch Business
        biz_stmt = select(Business).where(Business.id == business_id)
        biz_result = await self.db.execute(biz_stmt)
        business = biz_result.scalar_one_or_none()
        if not business:
            raise ValueError(f"Business with id {business_id} not found")

        # 2. Fetch Transactions
        tx_stmt = (
            select(Transaction)
            .where(Transaction.business_id == business_id)
            .order_by(Transaction.transaction_date.asc())
        )
        tx_result = await self.db.execute(tx_stmt)
        transactions = list(tx_result.scalars().all())

        # 3. Handle Fraud Alerts
        if recalculate_fraud and transactions:
            try:
                fraud_service = FraudService(self.db)
                await fraud_service.analyze_all_transactions(business_id)
            except Exception as e:
                logger.warning("Optional fraud recalculation failed: %s", e)

        alert_stmt = select(FraudAlert).where(FraudAlert.business_id == business_id)
        alert_result = await self.db.execute(alert_stmt)
        alerts = list(alert_result.scalars().all())

        # 4. Feature Extraction & Scoring
        features = extract_credit_features(transactions, alerts, business)
        score_result: CreditScoreResult = self.engine.score(features)

        # 5. Build Explanation Payload
        explanation_payload = {
            "positive_factors": score_result.positive_factors,
            "negative_factors": score_result.negative_factors,
            "detailed_factors": [asdict(f) for f in score_result.detailed_factors],
            "metrics": score_result.features,
        }

        # 6. Save CreditProfile
        profile = CreditProfile(
            business_id=business_id,
            cash_flow_score=score_result.components["cash_flow_health"],
            stability_score=score_result.components["financial_stability"],
            revenue_consistency_score=score_result.components["revenue_consistency"],
            expense_discipline_score=score_result.components["expense_discipline"],
            repayment_capacity_score=score_result.components["repayment_capacity"],
            transaction_behavior_score=score_result.components["transaction_behavior"],
            fraud_risk_score=score_result.components["fraud_risk"],
            trust_score=score_result.trust_score,
            explanation=json.dumps(explanation_payload),
        )

        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)

        return _profile_to_response(profile)

    async def get_latest_profile(
        self, business_id: uuid.UUID, auto_assess_if_missing: bool = True
    ) -> CreditProfileResponse | None:
        """
        Retrieves the latest CreditProfile for a business.
        If none exists and auto_assess_if_missing is True, triggers an assessment.
        """
        stmt = (
            select(CreditProfile)
            .where(CreditProfile.business_id == business_id)
            .order_by(CreditProfile.created_at.desc())
            .limit(1)
        )
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()

        if profile:
            return _profile_to_response(profile)

        if auto_assess_if_missing:
            return await self.assess_credit(business_id)

        return None
