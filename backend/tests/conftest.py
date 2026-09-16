"""
FINBRIDGE — Test Configuration & Fixtures
Uses in-memory SQLite (StaticPool) and mocked Firebase token verification.
"""

import asyncio
import uuid
from collections.abc import AsyncGenerator
from typing import Any
from unittest.mock import patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

import app.models  # ensure models & metadata are fully populated  # noqa: F401
from app.core.database import Base, get_db
from app.main import app as fastapi_app

# ---------------------------------------------------------------------------
# In-memory SQLite test engine (StaticPool shares 1 connection in memory)
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)

TestSessionFactory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ---------------------------------------------------------------------------
# Session fixture
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create tables, yield a clean session, drop tables after each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionFactory() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ---------------------------------------------------------------------------
# HTTP client fixture
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client with DB dependency overridden to test session."""

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise

    fastapi_app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=fastapi_app), base_url="http://test"
    ) as ac:
        yield ac

    fastapi_app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Firebase mock helper
# ---------------------------------------------------------------------------

def make_firebase_claims(uid: str = None, email: str = "test@example.com") -> dict[str, Any]:
    """Return a fake decoded Firebase token payload."""
    return {
        "uid": uid or str(uuid.uuid4()),
        "email": email,
        "email_verified": True,
    }


# ---------------------------------------------------------------------------
# pytest-asyncio config
# ---------------------------------------------------------------------------

pytest_plugins = ["pytest_asyncio"]
