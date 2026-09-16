"""
FINBRIDGE — Loan Model (Stub)
Core FT-03 entity: loan lifecycle.
Full implementation: Part 02.
"""

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Loan(UUIDMixin, TimestampMixin, Base):
    """
    Micro-loan record linked to a business.
    [STUB] — Full implementation in Part 02.
    """

    __tablename__ = "loans"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount_requested: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    amount_approved: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    interest_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    tenure_months: Mapped[int | None] = mapped_column(nullable=True)
    purpose: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False, index=True)
    credit_score_at_application: Mapped[int | None] = mapped_column(nullable=True)
