"""
FINBRIDGE — Alternative Credit Scoring Tests (Part 05)
Tests:
- feature extraction
- sub-score calculation
- weighted score & weights integrity
- boundary cases:
  - zero revenue
  - negative cash flow
  - high fraud risk
  - empty transactions
- deterministic output guarantees
- metric-backed explainability
- API endpoint integration:
  - POST /api/v1/credit/assess
  - GET  /api/v1/credit/profile
"""

from datetime import date
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch
import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.credit_scoring import (
    SCORE_WEIGHTS,
    CreditScoringEngine,
)
from app.ml.feature_engineering import (
    BusinessCreditFeatures,
    extract_credit_features,
)
from app.models.business import Business
from app.models.transaction import Transaction
from app.models.user import User
from tests.conftest import make_firebase_claims


# ─────────────────────────────────────────────────────────────────────────────
# In-memory test fixtures and helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_tx(
    txn_date: str,
    amount: float,
    txn_type: str,
    category: str = "Miscellaneous",
    merchant: str | None = None,
) -> SimpleNamespace:
    return SimpleNamespace(
        amount=Decimal(str(amount)),
        transaction_type=txn_type,
        transaction_date=date.fromisoformat(txn_date),
        timestamp=None,
        category=category,
        merchant=merchant,
    )


def make_alert(risk_level: str = "LOW", risk_score: int = 10) -> SimpleNamespace:
    return SimpleNamespace(
        risk_level=risk_level,
        risk_score=risk_score,
    )


def make_biz(age: int = 3, turnover: float = 1_200_000.0) -> SimpleNamespace:
    return SimpleNamespace(
        business_age=age,
        annual_turnover=Decimal(str(turnover)),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. Weights & Integrity Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestWeightsIntegrity:
    def test_weights_sum_to_one(self):
        """Prompt-specified weights must exactly equal 100% (1.0)."""
        total_weight = sum(SCORE_WEIGHTS.values())
        assert abs(total_weight - 1.0) < 1e-6

    def test_all_seven_components_present(self):
        expected_components = {
            "financial_stability": 0.25,
            "cash_flow_health": 0.20,
            "revenue_consistency": 0.15,
            "expense_discipline": 0.10,
            "repayment_capacity": 0.15,
            "transaction_behavior": 0.10,
            "fraud_risk": 0.05,
        }
        assert SCORE_WEIGHTS == expected_components


# ─────────────────────────────────────────────────────────────────────────────
# 2. Feature Extraction Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestFeatureExtraction:
    def test_empty_transactions(self):
        features = extract_credit_features([])
        assert features.total_transactions == 0
        assert features.avg_monthly_revenue == 0.0
        assert features.avg_monthly_expense == 0.0
        assert features.net_cash_flow == 0.0
        assert features.expense_ratio == 0.0
        assert features.fraud_alert_rate == 0.0

    def test_multi_month_cashflow_features(self):
        txns = [
            make_tx("2026-01-10", 100_000, "credit"),
            make_tx("2026-01-15", 60_000, "debit"),
            make_tx("2026-02-10", 120_000, "credit"),
            make_tx("2026-02-15", 70_000, "debit"),
        ]
        biz = make_biz(age=4, turnover=1_500_000)
        alerts = [make_alert("LOW", 10), make_alert("LOW", 15)]

        features = extract_credit_features(txns, alerts, biz)
        assert features.active_months == 2
        assert features.total_transactions == 4
        assert features.total_credits == 2
        assert features.total_debits == 2
        assert features.avg_monthly_revenue == 110_000.0  # (100k + 120k) / 2
        assert features.avg_monthly_expense == 65_000.0   # (60k + 70k) / 2
        assert features.net_cash_flow == 45_000.0
        assert features.business_age_years == 4.0
        assert features.fraud_alert_rate == 0.0
        assert features.repayment_capacity > 0.30  # ~40.9% margin


# ─────────────────────────────────────────────────────────────────────────────
# 3. Sub-Score & Scoring Calculation Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestSubScoreCalculation:
    def test_sub_scores_ranges_and_weighted_total(self):
        engine = CreditScoringEngine()
        txns = [
            make_tx("2026-01-05", 50_000, "credit"),
            make_tx("2026-01-12", 20_000, "debit"),
            make_tx("2026-02-05", 55_000, "credit"),
            make_tx("2026-02-12", 22_000, "debit"),
            make_tx("2026-03-05", 52_000, "credit"),
            make_tx("2026-03-12", 21_000, "debit"),
        ]
        features = extract_credit_features(txns, [], make_biz(age=3))
        result = engine.score(features)

        # Trust score in valid range
        assert 0 <= result.trust_score <= 100

        # Sub-scores in valid range
        for name, score in result.components.items():
            assert 0 <= score <= 100, f"Sub-score {name} out of bounds: {score}"

        # Weighted calculation check
        expected_score = round(
            sum(result.components[k] * SCORE_WEIGHTS[k] for k in SCORE_WEIGHTS)
        )
        assert result.trust_score == expected_score


# ─────────────────────────────────────────────────────────────────────────────
# 4. Boundary Cases
# ─────────────────────────────────────────────────────────────────────────────

class TestBoundaryCases:
    def test_zero_revenue_boundary(self):
        """Zero revenue with ongoing expenses should have heavily penalized scores."""
        engine = CreditScoringEngine()
        txns = [
            make_tx("2026-01-10", 25_000, "debit"),
            make_tx("2026-02-10", 30_000, "debit"),
        ]
        features = extract_credit_features(txns, [], make_biz(age=1))
        result = engine.score(features)

        assert features.avg_monthly_revenue == 0.0
        assert features.avg_monthly_expense > 0.0
        assert features.net_cash_flow < 0.0

        # Sub-scores for revenue and cash flow must be critically low
        assert result.components["revenue_consistency"] == 0
        assert result.components["repayment_capacity"] == 0
        assert result.components["cash_flow_health"] <= 20
        assert result.trust_score < 40

        # Verify negative factor cited
        assert any("Zero" in s or "Deficit" in s or "Operating Cash Flow" in s for s in result.negative_factors)

    def test_negative_cash_flow_boundary(self):
        """Business with high expenses exceeding revenue (deficit)."""
        engine = CreditScoringEngine()
        txns = [
            make_tx("2026-01-05", 30_000, "credit"),
            make_tx("2026-01-15", 80_000, "debit"),  # severe burn
        ]
        features = extract_credit_features(txns, [], make_biz(age=2))
        result = engine.score(features)

        assert features.net_cash_flow == -50_000.0
        assert features.expense_ratio > 1.5
        assert result.components["cash_flow_health"] <= 35
        assert result.components["expense_discipline"] <= 30
        assert any("Deficit" in factor or "Negative" in factor for factor in result.negative_factors)

    def test_high_fraud_risk_boundary(self):
        """Transactions triggered multiple high risk alerts."""
        engine = CreditScoringEngine()
        txns = [
            make_tx("2026-01-05", 80_000, "credit"),
            make_tx("2026-01-10", 40_000, "debit"),
            make_tx("2026-01-15", 30_000, "debit"),
        ]
        # Flag all transactions with high risk alerts
        alerts = [
            make_alert("HIGH", 85),
            make_alert("HIGH", 90),
            make_alert("MEDIUM", 65),
        ]
        features = extract_credit_features(txns, alerts, make_biz(age=2))
        result = engine.score(features)

        assert features.fraud_alert_rate >= 0.9
        # Fraud risk component score should drop significantly
        assert result.components["fraud_risk"] <= 25
        assert any("Anomaly" in f or "Fraud" in f for f in result.negative_factors)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Determinism Guarantee
# ─────────────────────────────────────────────────────────────────────────────

class TestDeterminism:
    def test_output_is_strictly_deterministic(self):
        """Running the assessment multiple times on the same data must yield identical results."""
        txns = [
            make_tx("2026-01-01", 15_000, "credit"),
            make_tx("2026-01-10", 5_000, "debit"),
            make_tx("2026-02-01", 20_000, "credit"),
            make_tx("2026-02-15", 8_000, "debit"),
        ]
        biz = make_biz(age=2, turnover=250_000)
        alerts = [make_alert("LOW", 12)]

        engine = CreditScoringEngine()

        res1 = engine.score(extract_credit_features(txns, alerts, biz))
        res2 = engine.score(extract_credit_features(txns, alerts, biz))

        assert res1.trust_score == res2.trust_score
        assert res1.components == res2.components
        assert res1.positive_factors == res2.positive_factors
        assert res1.negative_factors == res2.negative_factors
        assert res1.features == res2.features


# ─────────────────────────────────────────────────────────────────────────────
# 6. Explainability Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestExplainability:
    def test_every_factor_has_backed_metric(self):
        """Every generated factor must be associated with concrete metric values."""
        engine = CreditScoringEngine()
        txns = [
            make_tx("2026-01-05", 100_000, "credit"),
            make_tx("2026-01-10", 40_000, "debit"),
            make_tx("2026-02-05", 110_000, "credit"),
            make_tx("2026-02-10", 45_000, "debit"),
        ]
        features = extract_credit_features(txns, [], make_biz(age=3))
        result = engine.score(features)

        assert len(result.positive_factors) > 0
        assert len(result.detailed_factors) > 0

        for df in result.detailed_factors:
            assert df.name
            assert df.metric_name
            assert df.metric_value
            assert df.impact in ("positive", "negative")


# ─────────────────────────────────────────────────────────────────────────────
# 7. API Endpoints Integration Tests
# ─────────────────────────────────────────────────────────────────────────────

FAKE_FIREBASE_UID = "credit_test_user_uid_101"
USER_EMAIL = "credit_msme@example.com"
FAKE_TOKEN = "fake.credit.token"


def _mock_verify(token: str) -> dict:
    return make_firebase_claims(uid=FAKE_FIREBASE_UID, email=USER_EMAIL)


async def _setup_business_with_txns(client: AsyncClient, db_session: AsyncSession):
    # 1. Register user
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "firebase_id_token": FAKE_TOKEN,
                "name": "Ramesh Kumar",
                "email": USER_EMAIL,
            },
        )
        assert reg_res.status_code in (200, 201)

    headers = {"Authorization": f"Bearer {FAKE_TOKEN}"}

    # 2. Create business
    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        biz_res = await client.post(
            "/api/v1/business/profile",
            json={
                "business_name": "Ramesh Electronics & Hardware",
                "business_type": "Retail",
                "location": "Bengaluru, Karnataka",
                "business_age": 4,
                "annual_turnover": "1800000.00",
            },
            headers=headers,
        )
        assert biz_res.status_code in (200, 201)
        biz_data = biz_res.json()
        biz_id = uuid.UUID(biz_data["id"])

        # 3. Insert transactions in DB directly
        t1 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 1, 10),
            amount=Decimal("75000.00"),
            transaction_type="credit",
            category="Revenue",
            merchant="UPI-Customer Collections",
        )
        t2 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 1, 15),
            amount=Decimal("35000.00"),
            transaction_type="debit",
            category="Inventory",
            merchant="Wholesale Distributors",
        )
        t3 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 2, 10),
            amount=Decimal("80000.00"),
            transaction_type="credit",
            category="Revenue",
            merchant="UPI-Customer Collections",
        )
        t4 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 2, 15),
            amount=Decimal("38000.00"),
            transaction_type="debit",
            category="Rent",
            merchant="Commercial Landlord",
        )
        db_session.add_all([t1, t2, t3, t4])
        await db_session.commit()

        return biz_id, headers


@pytest.mark.asyncio
async def test_api_assess_and_get_credit_profile(client: AsyncClient, db_session: AsyncSession):
    biz_id, headers = await _setup_business_with_txns(client, db_session)

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        # Assess
        assess_res = await client.post(
            "/api/v1/credit/assess",
            json={"recalculate_fraud": False},
            headers=headers,
        )
        assert assess_res.status_code == 200, assess_res.text
        data = assess_res.json()

        assert "trust_score" in data
        assert 0 <= data["trust_score"] <= 100
        assert "components" in data
        assert data["components"]["financial_stability"] > 0
        assert data["components"]["cash_flow_health"] > 0
        assert "positive_factors" in data
        assert len(data["positive_factors"]) > 0
        assert "metrics" in data
        assert data["metrics"]["avg_monthly_revenue"] > 0

        # Get latest profile
        get_res = await client.get("/api/v1/credit/profile", headers=headers)
        assert get_res.status_code == 200
        get_data = get_res.json()
        assert get_data["id"] == data["id"]
        assert get_data["trust_score"] == data["trust_score"]
