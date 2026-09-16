"""
FINBRIDGE — Transaction Model (Stub)
Financial transactions for FT-05 analytics and FT-03 credit assessment.
Full implementation: Part 02.
"""

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Transaction(UUIDMixin, TimestampMixin, Base):
    """
    Financial transaction record for an MSME business.
    [STUB] — Full implementation in Part 02.
    """

    __tablename__ = "transactions"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(10), nullable=False)  # credit | debit
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)  # upi | bank | cash
    is_flagged: Mapped[bool] = mapped_column(default=False, nullable=False)
