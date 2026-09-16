"""
FINBRIDGE — Loan Assessment & Repayment Simulation Tests (Part 06)
Covers:
- Reducing-balance EMI math against known benchmark financial calculations
- Interest and total repayment calculations
- Repayment burden calculations
- Recommended loan range generation
- Boundary cases:
  - High requested amount (over-borrowing triggers)
  - Low and negative cash flow
  - Zero income
  - High fraud risk
- API endpoints:
  - POST /api/v1/loans/apply
  - POST /api/v1/loans/assess
  - POST /api/v1/loans/simulate
"""

from datetime import date
from decimal import Decimal
from unittest.mock import patch
import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.loan_engine import LoanEngine
from app.models.business import Business
from app.models.transaction import Transaction
from tests.conftest import make_firebase_claims


# ─────────────────────────────────────────────────────────────────────────────
# 1. EMI Math & Amortization Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestEmiMath:
    def test_standard_emi_benchmark(self):
        """
        ₹1,00,000 @ 12% p.a. for 12 months:
        Monthly rate = 1%
        Formula: 100000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1) = 8,884.88
        Total repayment = 1,06,618.56
        Total interest = 6,618.56
        """
        res = LoanEngine.calculate_emi(100_000, 12.0, 12)
        assert abs(res.emi - 8884.88) < 0.05
        assert abs(res.total_repayment - 106618.56) < 0.10
        assert abs(res.total_interest - 6618.56) < 0.10
        assert res.principal == 100_000.0
        assert res.tenure_months == 12

    def test_zero_interest_rate(self):
        """0% interest rate should divide principal evenly with zero interest."""
        res = LoanEngine.calculate_emi(60_000, 0.0, 6)
        assert res.emi == 10_000.0
        assert res.total_repayment == 60_000.0
        assert res.total_interest == 0.0

    def test_single_month_tenure(self):
        """Single month tenure @ 12% p.a. (1% monthly)."""
        res = LoanEngine.calculate_emi(50_000, 12.0, 1)
        assert res.emi == 50_500.0
        assert res.total_interest == 500.0

    def test_zero_principal(self):
        """Zero principal produces zero EMI and zero repayment."""
        res = LoanEngine.calculate_emi(0, 14.0, 12)
        assert res.emi == 0.0
        assert res.total_interest == 0.0
        assert res.total_repayment == 0.0


# ─────────────────────────────────────────────────────────────────────────────
# 2. Loan Assessment & Recommended Range Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestLoanAssessment:
    def test_healthy_business_assessment(self):
        """Healthy business with strong cash flow receives reasonable loan range and low risk."""
        res = LoanEngine.assess_loan(
            requested_amount=100_000,
            tenure_months=12,
            purpose="Inventory Expansion",
            trust_score=85,
            net_cash_flow=60_000,
            avg_monthly_revenue=150_000,
            expense_ratio=0.60,
            repayment_capacity=0.40,
            fraud_alert_rate=0.0,
        )

        assert res.risk_level == "LOW"
        assert res.annual_interest_rate == 12.0
        assert res.recommended_max_amount >= 100_000
        assert res.recommended_min_amount >= 10_000
        assert res.post_loan_projected_surplus > 0
        assert res.repayment_burden_pct < 35.0
        assert not res.is_overborrowing_risk
        assert len(res.supporting_factors) > 0
        assert "Prototype Recommendation" in res.prototype_recommendation

    def test_high_requested_amount_triggers_overborrowing(self):
        """Requesting ₹10,00,000 on ₹20,000 monthly cash flow triggers over-borrowing cautions."""
        res = LoanEngine.assess_loan(
            requested_amount=1_000_000,
            tenure_months=12,
            purpose="Capital Outlay",
            trust_score=70,
            net_cash_flow=20_000,
            avg_monthly_revenue=80_000,
            expense_ratio=0.75,
            repayment_capacity=0.25,
            fraud_alert_rate=0.0,
        )

        assert res.is_overborrowing_risk
        assert res.post_loan_projected_surplus < 0  # Massive deficit
        assert res.repayment_burden_pct > 100.0
        assert any("exceeds sustainable ceiling" in c for c in res.caution_factors)
        assert any("Operating Deficit Alert" in c for c in res.caution_factors)
        assert "Prototype Advisory" in res.prototype_recommendation

    def test_low_and_negative_cash_flow_boundary(self):
        """Negative cash flow should trigger cautions and produce conservative recommendations."""
        res = LoanEngine.assess_loan(
            requested_amount=50_000,
            tenure_months=6,
            purpose="Emergency Working Capital",
            trust_score=45,
            net_cash_flow=-15_000,  # Deficit
            avg_monthly_revenue=40_000,
            expense_ratio=1.37,
            repayment_capacity=-0.37,
            fraud_alert_rate=0.0,
        )

        assert res.risk_level == "HIGH"
        assert res.is_overborrowing_risk
        assert res.recommended_max_amount == 0.0
        assert any("negative" in c.lower() or "deficit" in c.lower() for c in res.caution_factors)

    def test_zero_income_boundary(self):
        """Zero revenue and zero cash flow should not recommend commercial loans."""
        res = LoanEngine.assess_loan(
            requested_amount=50_000,
            tenure_months=12,
            purpose="Seed",
            trust_score=20,
            net_cash_flow=0,
            avg_monthly_revenue=0,
            expense_ratio=0,
            repayment_capacity=0,
            fraud_alert_rate=0.0,
        )

        assert res.risk_level == "HIGH"
        assert res.recommended_max_amount == 0.0
        assert res.is_overborrowing_risk

    def test_high_fraud_risk_boundary(self):
        """Elevated fraud alert rate assigns high risk level and maximum interest tier."""
        res = LoanEngine.assess_loan(
            requested_amount=50_000,
            tenure_months=12,
            purpose="Equipment",
            trust_score=55,
            net_cash_flow=40_000,
            avg_monthly_revenue=100_000,
            expense_ratio=0.60,
            repayment_capacity=0.40,
            fraud_alert_rate=0.35,  # 35% flagged
        )

        assert res.risk_level == "HIGH"
        assert res.annual_interest_rate == 21.0
        assert any("Anomaly Telemetry" in c or "Risk Telemetry" in c for c in res.caution_factors)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Simulator Logic Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestLoanSimulator:
    def test_simulation_dynamics(self):
        """Simulate parameters dynamically and verify surplus change."""
        sim = LoanEngine.simulate(
            loan_amount=50_000,
            tenure_months=12,
            annual_interest_rate=12.0,
            trust_score=80,
            net_cash_flow=30_000,
        )

        assert abs(sim.emi - 4442.44) < 0.05
        assert sim.current_cash_flow == 30_000.0
        assert abs(sim.post_loan_cash_flow - (30000 - 4442.44)) < 0.10
        assert sim.repayment_burden_pct < 20.0
        assert not sim.is_overborrowing_risk


# ─────────────────────────────────────────────────────────────────────────────
# 4. API Endpoints Integration Tests
# ─────────────────────────────────────────────────────────────────────────────

FAKE_FIREBASE_UID = "loan_test_user_uid_202"
USER_EMAIL = "loan_msme@example.com"
FAKE_TOKEN = "fake.loan.token"


def _mock_verify(token: str) -> dict:
    return make_firebase_claims(uid=FAKE_FIREBASE_UID, email=USER_EMAIL)


async def _setup_business_for_loans(client: AsyncClient, db_session: AsyncSession):
    # 1. Register user
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(
            "/api/v1/auth/register",
            json={
                "firebase_id_token": FAKE_TOKEN,
                "name": "Kavita Sharma",
                "email": USER_EMAIL,
            },
        )

    headers = {"Authorization": f"Bearer {FAKE_TOKEN}"}

    # 2. Create business
    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        biz_res = await client.post(
            "/api/v1/business/profile",
            json={
                "business_name": "Sharma Handlooms",
                "business_type": "Retail & Textiles",
                "location": "Jaipur, Rajasthan",
                "business_age": 4,
                "annual_turnover": "1200000.00",
            },
            headers=headers,
        )
        biz_data = biz_res.json()
        biz_id = uuid.UUID(biz_data["id"])

        # 3. Add transactions for healthy cash flow
        t1 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 1, 10),
            amount=Decimal("90000.00"),
            transaction_type="credit",
            category="Revenue",
        )
        t2 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 1, 15),
            amount=Decimal("40000.00"),
            transaction_type="debit",
            category="Inventory",
        )
        t3 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 2, 10),
            amount=Decimal("95000.00"),
            transaction_type="credit",
            category="Revenue",
        )
        t4 = Transaction(
            business_id=biz_id,
            transaction_date=date(2026, 2, 15),
            amount=Decimal("42000.00"),
            transaction_type="debit",
            category="Rent",
        )
        db_session.add_all([t1, t2, t3, t4])
        await db_session.commit()

        return biz_id, headers


@pytest.mark.asyncio
async def test_api_loan_apply_and_assess_lifecycle(
    client: AsyncClient, db_session: AsyncSession
):
    biz_id, headers = await _setup_business_for_loans(client, db_session)

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        # 1. Submit Loan Application
        apply_res = await client.post(
            "/api/v1/loans/apply",
            json={
                "requested_amount": 75000.0,
                "tenure_months": 12,
                "purpose": "Festival Stock Inventory",
            },
            headers=headers,
        )
        assert apply_res.status_code == 201, apply_res.text
        app_data = apply_res.json()
        app_id = app_data["id"]
        assert app_data["requested_amount"] == 75000.0
        assert app_data["status"] == "draft"

        # 2. Assess Loan Application
        assess_res = await client.post(
            "/api/v1/loans/assess",
            json={"application_id": app_id},
            headers=headers,
        )
        assert assess_res.status_code == 200, assess_res.text
        assess_data = assess_res.json()
        assert assess_data["application_id"] == app_id
        assert assess_data["recommended_min_amount"] > 0
        assert assess_data["recommended_max_amount"] > 0
        assert assess_data["estimated_emi"] > 0
        assert assess_data["risk_level"] in ("LOW", "MEDIUM", "HIGH")
        assert len(assess_data["supporting_factors"]) > 0

        # 3. Simulate Loan
        sim_res = await client.post(
            "/api/v1/loans/simulate",
            json={"loan_amount": 60000.0, "tenure_months": 12},
            headers=headers,
        )
        assert sim_res.status_code == 200, sim_res.text
        sim_data = sim_res.json()
        assert sim_data["emi"] > 0
        assert sim_data["total_repayment"] > 60000.0
        assert sim_data["current_cash_flow"] > 0
