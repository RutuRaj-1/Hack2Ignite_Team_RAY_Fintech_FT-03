"""
FINBRIDGE — Database Connection (Part 02)
- Supports both SQLite (dev) and PostgreSQL/Supabase (prod).
- SQLite: no schema prefix, no connection pool.
- PostgreSQL: public schema, connection pool.
- Auto-creates tables on startup in dev mode.
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
# Engine — SQLite vs PostgreSQL
# ---------------------------------------------------------------------------

_is_sqlite = settings.is_sqlite

if _is_sqlite:
    # SQLite: no pool settings, check_same_thread=False required for async
    engine = create_async_engine(
        settings.database_url,
        echo=settings.app_debug,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL / Supabase
    engine = create_async_engine(
        settings.database_url,
        echo=settings.app_debug,
        pool_pre_ping=True,
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
    Shared declarative base.
    No schema prefix here — SQLite doesn't support schemas.
    PostgreSQL: set search_path=public in DATABASE_URL or via session event.
    """
    pass


# ---------------------------------------------------------------------------
# Table creation (development)
# ---------------------------------------------------------------------------

async def create_tables() -> None:
    """
    Create all tables that don't yet exist.
    Called on app startup in development / SQLite mode.
    In production, use Alembic migrations instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ---------------------------------------------------------------------------
# FastAPI Dependency
# ---------------------------------------------------------------------------

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async database session.

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
