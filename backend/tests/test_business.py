"""
FINBRIDGE — Business Profile Endpoint Tests (Part 02)

Covers:
- create business profile (authenticated)
- duplicate business profile (409)
- get business profile
- get profile when none exists (404)
- update business profile
- unauthorized access (no token)
"""

import uuid
from unittest.mock import patch

import pytest
from httpx import AsyncClient

from tests.conftest import make_firebase_claims


pytestmark = pytest.mark.asyncio


# ─────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────

REGISTER_URL = "/api/v1/auth/register"
BUSINESS_URL = "/api/v1/business/profile"
FIREBASE_UID = "biz_test_firebase_uid_001"
USER_EMAIL = "akhilesh@example.com"
FAKE_TOKEN = "fake.biz.token"

BUSINESS_DATA = {
    "business_name": "Dhumal Textiles",
    "business_type": "Manufacturing",
    "location": "Pune, Maharashtra",
    "business_age": 3,
    "annual_turnover": "1500000.00",
}


def _mock_verify(token: str) -> dict:
    return make_firebase_claims(uid=FIREBASE_UID, email=USER_EMAIL)


def _auth_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {FAKE_TOKEN}"}


# ─────────────────────────────────────────────
# Setup: register a user and return auth headers
# ─────────────────────────────────────────────

async def _register_user(client: AsyncClient) -> None:
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": "Akhilesh Dhumal",
            "email": USER_EMAIL,
        })


# ─────────────────────────────────────────────
# Business CRUD tests
# ─────────────────────────────────────────────

async def test_create_business_profile(client: AsyncClient) -> None:
    """Authenticated user can create a business profile."""
    await _register_user(client)

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        resp = await client.post(BUSINESS_URL, json=BUSINESS_DATA, headers=_auth_headers())

    assert resp.status_code == 201
    data = resp.json()
    assert data["business_name"] == BUSINESS_DATA["business_name"]
    assert data["location"] == BUSINESS_DATA["location"]
    assert data["business_age"] == BUSINESS_DATA["business_age"]


async def test_create_business_profile_duplicate(client: AsyncClient) -> None:
    """Creating a second profile for the same user → 409."""
    await _register_user(client)

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        await client.post(BUSINESS_URL, json=BUSINESS_DATA, headers=_auth_headers())
        resp = await client.post(BUSINESS_URL, json=BUSINESS_DATA, headers=_auth_headers())

    assert resp.status_code == 409
    assert "already exists" in resp.json()["detail"].lower()


async def test_get_business_profile(client: AsyncClient) -> None:
    """GET returns the user's business profile."""
    await _register_user(client)

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        await client.post(BUSINESS_URL, json=BUSINESS_DATA, headers=_auth_headers())
        resp = await client.get(BUSINESS_URL, headers=_auth_headers())

    assert resp.status_code == 200
    assert resp.json()["business_name"] == BUSINESS_DATA["business_name"]


async def test_get_business_profile_not_found(client: AsyncClient) -> None:
    """GET when no profile exists → 404."""
    await _register_user(client)

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        resp = await client.get(BUSINESS_URL, headers=_auth_headers())

    assert resp.status_code == 404


async def test_update_business_profile(client: AsyncClient) -> None:
    """PUT updates specified fields only."""
    await _register_user(client)

    with patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        await client.post(BUSINESS_URL, json=BUSINESS_DATA, headers=_auth_headers())
        resp = await client.put(
            BUSINESS_URL,
            json={"location": "Mumbai, Maharashtra", "business_age": 5},
            headers=_auth_headers(),
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["location"] == "Mumbai, Maharashtra"
    assert data["business_age"] == 5
    assert data["business_name"] == BUSINESS_DATA["business_name"]  # unchanged


async def test_business_unauthorized(client: AsyncClient) -> None:
    """No auth token → 401/403."""
    resp = await client.get(BUSINESS_URL)
    assert resp.status_code in (401, 403)


async def test_business_invalid_token(client: AsyncClient) -> None:
    """Invalid token → 401."""
    def bad_verify(token: str) -> dict:
        raise ValueError("Token expired")

    with patch("app.core.dependencies.verify_firebase_token", side_effect=bad_verify):
        resp = await client.get(BUSINESS_URL, headers=_auth_headers())

    assert resp.status_code == 401
