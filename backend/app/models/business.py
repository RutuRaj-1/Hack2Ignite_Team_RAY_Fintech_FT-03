"""
FINBRIDGE — Business Profile Model (Part 02)
Fields: id, user_id, business_name, business_type, location,
        business_age, annual_turnover, created_at, updated_at.
"""

import uuid

from sqlalchemy import ForeignKey, Integer, Numeric, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin
from decimal import Decimal
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.transaction import Transaction


class Business(UUIDMixin, TimestampMixin, Base):
    """
    MSME business profile — one per user (enforced by unique constraint).
    Core FT-03 entity for micro-lending and alternative credit assessment.
    """

    __tablename__ = "businesses"
    __table_args__ = (UniqueConstraint("user_id", name="uq_businesses_user_id"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    business_age: Mapped[int | None] = mapped_column(Integer, nullable=True)   # years in operation
    annual_turnover: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)

    # Back-reference to owner
    owner: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="business"
    )

    # One-to-many: a business has many transactions
    transactions: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        "Transaction", back_populates="business", cascade="all, delete-orphan"
    )
