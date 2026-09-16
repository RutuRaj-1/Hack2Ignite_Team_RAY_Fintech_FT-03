"""
FINBRIDGE — Business Profile Model (Stub)
Core entity for FT-03 micro-lending and alternative credit.
Full implementation: Part 02.
"""

import uuid

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Business(UUIDMixin, TimestampMixin, Base):
    """
    MSME business profile.
    Linked to a user (owner). Core entity for lending and credit.
    [STUB] — Full implementation in Part 02.
    """

    __tablename__ = "businesses"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    gstin: Mapped[str | None] = mapped_column(String(15), unique=True, nullable=True)
    pan: Mapped[str | None] = mapped_column(String(10), unique=True, nullable=True)
    annual_turnover: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    kyc_status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
