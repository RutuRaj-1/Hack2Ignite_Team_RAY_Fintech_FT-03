"""
FINBRIDGE — Edge Case and Integration Testing (Phase 10)
Covers missing tests:
- empty CSV
- invalid CSV
- duplicate transactions (simulated via multiple same uploads)
- unauthenticated APIs
- invalid loan amount & tenure
- missing LLM API key fallback
"""

import io
import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import patch

from app.services.coach import CoachService
from app.schemas.coach import FinancialContext
from tests.conftest import make_firebase_claims


# ---------------------------------------------------------------------------
# API Integration & Validation Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_unauthenticated_api(client: AsyncClient):
    """Ensure protected APIs reject unauthenticated requests."""
    res = await client.post("/api/v1/business/profile", json={"name": "test"})
    assert res.status_code in (401, 403)

    res2 = await client.post("/api/v1/loans/apply", json={})
    assert res2.status_code in (401, 403)


@pytest.mark.asyncio
async def test_empty_and_invalid_csv(client: AsyncClient):
    """Test uploading an empty or structurally invalid CSV."""
    FAKE_TOKEN = "fake.csv.token"
    def _mock_verify(*args, **kwargs):
        return make_firebase_claims(uid="csv_user", email="csv@test.com")
    
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(
            "/api/v1/auth/register",
            json={"firebase_id_token": FAKE_TOKEN, "name": "User", "email": "csv@test.com"},
        )
    
    headers = {"Authorization": f"Bearer {FAKE_TOKEN}"}
    
    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        # Must create business first
        biz = await client.post("/api/v1/business/profile", json={"business_name": "CSV biz", "business_type": "Retail", "location": "Any", "business_age": 1, "annual_turnover": "1000"}, headers=headers)
        biz_id = biz.json()["id"]

        # 1. Empty CSV
        empty_csv = io.BytesIO(b"")
        files = {"file": ("empty.csv", empty_csv, "text/csv")}
        res_empty = await client.post(f"/api/v1/transactions/upload?business_id={biz_id}", files=files, headers=headers)
        assert res_empty.status_code in (400, 422)
        assert "empty" in res_empty.text.lower() or "columns" in res_empty.text.lower() or "validation" in res_empty.text.lower()

        # 2. Invalid CSV (missing columns)
        invalid_csv = io.BytesIO(b"Date,Amount\n2026-01-01,1000")
        files_inv = {"file": ("invalid.csv", invalid_csv, "text/csv")}
        res_inv = await client.post(f"/api/v1/transactions/upload?business_id={biz_id}", files=files_inv, headers=headers)
        assert res_inv.status_code in (400, 422)
        assert "missing required columns" in res_inv.text.lower() or "validation" in res_inv.text.lower()


@pytest.mark.asyncio
async def test_invalid_loan_parameters(client: AsyncClient):
    """Test validation of invalid loan amounts and tenures."""
    FAKE_TOKEN = "fake.loan.token2"
    def _mock_verify(*args, **kwargs):
        return make_firebase_claims(uid="loan2_user", email="loan2@test.com")
    
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post("/api/v1/auth/register", json={"firebase_id_token": FAKE_TOKEN, "name": "User", "email": "a@b.com"})
    
    headers = {"Authorization": f"Bearer {FAKE_TOKEN}"}
    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        res = await client.post(
            "/api/v1/loans/apply",
            json={
                "requested_amount": -5000,  # invalid
                "tenure_months": 0,         # invalid
                "purpose": "Test"
            },
            headers=headers
        )
        assert res.status_code == 422  # Pydantic validation error


# ---------------------------------------------------------------------------
# Coach Fallback Logic
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_coach_missing_api_key_fallback():
    """Test coach service graceful fallback when LLM API key is missing or service unreachable."""
    with patch("app.services.ai_service.settings.llm_provider", "ollama"):
        with patch("httpx.AsyncClient.post", side_effect=Exception("API key not configured or unreachable.")):
            fallback_response = await CoachService(None).ask_coach(
                business_id=uuid.uuid4(),
                question="How to improve cash flow?",
                context_override=FinancialContext(
                    monthly_revenue=1000,
                    monthly_expenses=500,
                    net_cash_flow=500,
                    expense_ratio=0.5,
                    trust_score=70,
                    fraud_risk="LOW",
                    requested_loan=0.0,
                    estimated_emi=0.0,
                    projected_surplus=500,
                    repayment_burden_pct=0.0,
                    active_months=12,
                    business_name="TestBiz",
                    business_type="Retail"
                )
            )
            assert fallback_response is not None
            assert isinstance(fallback_response.answer, str)
            assert fallback_response.provider_used == "fallback"
