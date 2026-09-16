"""
FINBRIDGE — AI Financial Coach & Literacy Tests (Part 08)
Covers:
- Missing LLM API credentials & fallback reliability
- Normal question handling
- Loan affordability question answering grounded in real cash flow & EMI
- Fraud explanation grounded in rule telemetry
- Financial education questions (EMI, Repayment Burden, Cash Flow)
- Safety rules (no guaranteed approvals, uses prototype data disclaimer)
- API endpoints: POST /api/v1/coach/ask, GET /api/v1/coach/education, POST /api/v1/coach/explain-fraud
"""

from unittest.mock import patch
import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.coach import FinancialContext
from app.services.ai_service import AIService
from tests.conftest import make_firebase_claims


# ─────────────────────────────────────────────────────────────────────────────
# 1. AI Service Unit Tests & Fallback Engine
# ─────────────────────────────────────────────────────────────────────────────

class TestAIService:
    @pytest.mark.asyncio
    async def test_missing_llm_api_fallback(self):
        """When LLM API is unavailable, the deterministic fallback generates rich responses."""
        ai = AIService()
        # Force fallback by setting provider to fallback
        ai.provider = "fallback"

        ctx = FinancialContext(
            monthly_revenue=120_000.0,
            monthly_expenses=70_000.0,
            net_cash_flow=50_000.0,
            expense_ratio=0.5833,
            trust_score=82,
            fraud_risk="LOW",
        )

        ans, provider = await ai.financial_coach("Hello, what is my financial situation?", ctx)
        assert provider == "fallback"
        assert "Based on the available prototype data" in ans
        assert "120,000" in ans or "50,000" in ans

    @pytest.mark.asyncio
    async def test_loan_affordability_question_positive(self):
        """Tests 'Can I afford a ₹50,000 loan?' when business has strong cash flow."""
        ai = AIService()
        ai.provider = "fallback"

        ctx = FinancialContext(
            monthly_revenue=150_000.0,
            monthly_expenses=90_000.0,
            net_cash_flow=60_000.0,
            expense_ratio=0.60,
            trust_score=85,
            fraud_risk="LOW",
        )

        ans, _ = await ai.financial_coach("Can I afford a ₹50,000 loan?", ctx)
        assert "Based on the available prototype data" in ans
        assert "50,000" in ans
        # Should explain that with 60k surplus, 50k loan is affordable and burden is safe
        assert "afford" in ans.lower()
        assert "surplus" in ans.lower()

    @pytest.mark.asyncio
    async def test_loan_affordability_question_deficit(self):
        """Tests affordability when business is running at an operating deficit."""
        ai = AIService()
        ai.provider = "fallback"

        ctx = FinancialContext(
            monthly_revenue=40_000.0,
            monthly_expenses=55_000.0,
            net_cash_flow=-15_000.0,
            expense_ratio=1.375,
            trust_score=35,
            fraud_risk="MEDIUM",
        )

        ans, _ = await ai.financial_coach("Can I afford a ₹50,000 loan?", ctx)
        assert "Based on the available prototype data" in ans
        assert "not currently recommended" in ans.lower() or "deficit" in ans.lower()
        assert "15,000" in ans

    @pytest.mark.asyncio
    async def test_financial_trust_score_question(self):
        """Tests 'Why is my financial trust score low?' explaining drivers."""
        ai = AIService()
        ai.provider = "fallback"

        ctx = FinancialContext(
            monthly_revenue=50_000.0,
            monthly_expenses=45_000.0,
            net_cash_flow=5_000.0,
            expense_ratio=0.90,  # high expenses
            trust_score=45,
            fraud_risk="HIGH",
        )

        ans, _ = await ai.financial_coach("Why is my financial trust score low?", ctx)
        assert "Based on the available prototype data" in ans
        assert "45/100" in ans
        assert "expense" in ans.lower() or "risk" in ans.lower()

    @pytest.mark.asyncio
    async def test_financial_education_questions(self):
        """Tests educational queries: EMI and Repayment Burden."""
        ai = AIService()
        ai.provider = "fallback"

        ctx = FinancialContext(
            monthly_revenue=80_000.0,
            monthly_expenses=50_000.0,
            net_cash_flow=30_000.0,
            expense_ratio=0.625,
            trust_score=72,
        )

        # 1. EMI Question
        emi_ans, _ = await ai.financial_coach("What does EMI mean?", ctx)
        assert "Based on the available prototype data" in emi_ans
        assert "Equated Monthly Installment" in emi_ans

        # 2. Repayment Burden Question
        burden_ans, _ = await ai.financial_coach("What is repayment burden?", ctx)
        assert "Based on the available prototype data" in burden_ans
        assert "35%" in burden_ans

    def test_explain_fraud_alert(self):
        """Tests explain_fraud_alert method."""
        ai = AIService()
        alert_data = {
            "amount": 125000.0,
            "risk_level": "HIGH",
            "detected_reasons": ["unusually large transaction", "off-hours velocity"],
        }
        res = ai.explain_fraud_alert(alert_data)
        assert "Based on the available prototype data" in res
        assert "125,000" in res
        assert "unusually large transaction" in res

    def test_safety_and_no_approval_guarantees(self):
        """Tests assistant never issues binding approvals."""
        ai = AIService()
        ai.provider = "fallback"
        ctx = FinancialContext(
            monthly_revenue=200_000.0,
            monthly_expenses=100_000.0,
            net_cash_flow=100_000.0,
            trust_score=95,
        )
        ans = ai._deterministic_coach_response("Can I get a loan approved right now?", ctx)
        # Never says "You are approved"
        assert "You are approved" not in ans
        assert "Based on the available prototype data" in ans


# ─────────────────────────────────────────────────────────────────────────────
# 2. API Endpoints Integration Tests
# ─────────────────────────────────────────────────────────────────────────────

FAKE_FIREBASE_UID = "coach_test_user_uid_303"
USER_EMAIL = "coach_msme@example.com"
FAKE_TOKEN = "fake.coach.token"


def _mock_verify(token: str) -> dict:
    return make_firebase_claims(uid=FAKE_FIREBASE_UID, email=USER_EMAIL)


async def _setup_business_for_coach(client: AsyncClient, db_session: AsyncSession):
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(
            "/api/v1/auth/register",
            json={
                "firebase_id_token": FAKE_TOKEN,
                "name": "Devendra Joshi",
                "email": USER_EMAIL,
            },
        )

    headers = {"Authorization": f"Bearer {FAKE_TOKEN}"}

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        biz_res = await client.post(
            "/api/v1/business/profile",
            json={
                "business_name": "Joshi Spices & Agro",
                "business_type": "Wholesale Agro",
                "location": "Nashik, Maharashtra",
                "business_age": 3,
                "annual_turnover": "1600000.00",
            },
            headers=headers,
        )
        biz_data = biz_res.json()
        biz_id = uuid.UUID(biz_data["id"])
        return biz_id, headers


@pytest.mark.asyncio
async def test_api_ask_coach_and_get_education(client: AsyncClient, db_session: AsyncSession):
    biz_id, headers = await _setup_business_for_coach(client, db_session)

    # 1. Get Educational Cards (no auth required)
    edu_res = await client.get("/api/v1/coach/education")
    assert edu_res.status_code == 200
    edu_data = edu_res.json()
    assert "cards" in edu_data
    assert len(edu_data["cards"]) == 7
    topics = [c["topic"] for c in edu_data["cards"]]
    assert "Cash Flow" in topics
    assert "EMI" in topics
    assert "Repayment Burden" in topics

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        # 2. Ask Financial Coach
        ask_res = await client.post(
            "/api/v1/coach/ask",
            json={"question": "Can I afford a ₹50,000 loan?"},
            headers=headers,
        )
        assert ask_res.status_code == 200, ask_res.text
        ask_data = ask_res.json()
        assert "answer" in ask_data
        assert "Based on the available prototype data" in ask_data["answer"]
        assert "context_used" in ask_data
        assert "provider_used" in ask_data
        assert len(ask_data["suggested_questions"]) > 0

        # 3. Get Financial Context for current business
        ctx_res = await client.get("/api/v1/coach/context", headers=headers)
        assert ctx_res.status_code == 200
        ctx_data = ctx_res.json()
        assert "monthly_revenue" in ctx_data
        assert "net_cash_flow" in ctx_data

        # 4. Explain Fraud Alert
        fraud_res = await client.post(
            "/api/v1/coach/explain-fraud",
            json={
                "amount": 85000.0,
                "risk_level": "MEDIUM",
                "detected_reasons": ["unusually large amount"],
            },
            headers=headers,
        )
        assert fraud_res.status_code == 200
        assert "85,000" in fraud_res.json()["explanation"]
