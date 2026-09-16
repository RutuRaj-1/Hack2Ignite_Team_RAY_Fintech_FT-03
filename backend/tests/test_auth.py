"""
FINBRIDGE — Auth Endpoint Tests (Part 02)

Covers:
- registration (happy path)
- duplicate email (409)
- duplicate Firebase UID (409)
- login (happy path)
- login with invalid token (401)
- GET /auth/me (authenticated)
- GET /auth/me without token (401)
"""

import uuid
from unittest.mock import patch

import pytest
from httpx import AsyncClient

from tests.conftest import make_firebase_claims


pytestmark = pytest.mark.asyncio


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/auth/me"

FIREBASE_UID = "firebase_uid_test_001"
USER_EMAIL = "ruturaj@example.com"
USER_NAME = "Ruturaj Bhome"
FAKE_TOKEN = "fake.firebase.id.token"


def _mock_verify(token: str) -> dict:
    """Return fixed claims regardless of token value."""
    return make_firebase_claims(uid=FIREBASE_UID, email=USER_EMAIL)


def _mock_verify_bad(token: str) -> dict:
    raise ValueError("Firebase token is invalid or expired.")


# ─────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────

async def test_register_success(client: AsyncClient) -> None:
    """Happy path: register a new user."""
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        resp = await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": USER_NAME,
            "email": USER_EMAIL,
        })

    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["email"] == USER_EMAIL
    assert data["user"]["name"] == USER_NAME
    assert data["user"]["firebase_uid"] == FIREBASE_UID
    assert data["message"] == "Account created successfully."


async def test_register_duplicate_uid(client: AsyncClient) -> None:
    """Registering twice with the same Firebase UID → 409."""
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": USER_NAME,
            "email": USER_EMAIL,
        })
        resp = await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": USER_NAME,
            "email": USER_EMAIL,
        })

    assert resp.status_code == 409
    assert "already exists" in resp.json()["detail"].lower()


async def test_register_duplicate_email(client: AsyncClient) -> None:
    """Different UID but same email → 409 on second attempt."""
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": USER_NAME,
            "email": USER_EMAIL,
        })

    def same_email_diff_uid(token: str) -> dict:
        return make_firebase_claims(uid="different_uid_999", email=USER_EMAIL)

    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=same_email_diff_uid):
        resp = await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": "Other User",
            "email": USER_EMAIL,
        })

    assert resp.status_code == 409


async def test_register_invalid_token(client: AsyncClient) -> None:
    """Bad Firebase token → 401."""
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify_bad):
        resp = await client.post(REGISTER_URL, json={
            "firebase_id_token": "garbage_token",
            "name": USER_NAME,
            "email": USER_EMAIL,
        })

    assert resp.status_code == 401


# ─────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────

async def test_login_success(client: AsyncClient) -> None:
    """Happy path: login returns user info."""
    # First register
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": USER_NAME,
            "email": USER_EMAIL,
        })

    # Then login
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        resp = await client.post(LOGIN_URL, json={"firebase_id_token": FAKE_TOKEN})

    assert resp.status_code == 200
    assert resp.json()["user"]["email"] == USER_EMAIL
    assert resp.json()["message"] == "Login successful."


async def test_login_invalid_token(client: AsyncClient) -> None:
    """Invalid token → 401."""
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify_bad):
        resp = await client.post(LOGIN_URL, json={"firebase_id_token": "bad"})

    assert resp.status_code == 401


async def test_login_unregistered_user(client: AsyncClient) -> None:
    """Valid Firebase token but user not in DB → 404."""
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        resp = await client.post(LOGIN_URL, json={"firebase_id_token": FAKE_TOKEN})

    assert resp.status_code == 404


# ─────────────────────────────────────────────
# /auth/me
# ─────────────────────────────────────────────

async def test_me_authenticated(client: AsyncClient) -> None:
    """Valid token → returns user profile."""
    # Register first
    with patch("app.api.v1.endpoints.auth.verify_firebase_token", side_effect=_mock_verify):
        await client.post(REGISTER_URL, json={
            "firebase_id_token": FAKE_TOKEN,
            "name": USER_NAME,
            "email": USER_EMAIL,
        })

    # /auth/me — mock both firebase_admin module paths
    with patch("app.core.firebase_admin.verify_firebase_token", side_effect=_mock_verify), \
         patch("app.core.dependencies.verify_firebase_token", side_effect=_mock_verify):
        resp = await client.get(ME_URL, headers={"Authorization": f"Bearer {FAKE_TOKEN}"})

    assert resp.status_code == 200
    assert resp.json()["email"] == USER_EMAIL


async def test_me_no_token(client: AsyncClient) -> None:
    """No Authorization header → 401/403 (HTTPBearer)."""
    resp = await client.get(ME_URL)
    assert resp.status_code in (401, 403)
