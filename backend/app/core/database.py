"""
FINBRIDGE — Database Connection
SQLAlchemy async engine + session factory.
Designed for PostgreSQL with Supabase compatibility.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

engine = create_async_engine(
    settings.database_url,
    echo=settings.app_debug,       # Log SQL in development
    pool_pre_ping=True,            # Detect stale connections
    pool_size=10,
    max_overflow=20,
)

# ---------------------------------------------------------------------------
# Session Factory
# ---------------------------------------------------------------------------

AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# ---------------------------------------------------------------------------
# Declarative Base
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    """
    Shared SQLAlchemy declarative base.
    All FINBRIDGE ORM models inherit from this.
    Schema: 'public' (Supabase default).
    """
    __table_args__ = {"schema": "public"}


# ---------------------------------------------------------------------------
# FastAPI Dependency
# ---------------------------------------------------------------------------

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async database session for use as a FastAPI dependency.

    Usage:
        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
