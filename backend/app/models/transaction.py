"""
FINBRIDGE — Transaction Model (Part 03)
Financial transactions for FT-05 analytics.

Fields:
  id                UUID primary key
  business_id       FK → businesses.id
  transaction_date  Date of the transaction (from CSV or manual entry)
  amount            Decimal(15,2) — always positive; direction encoded by type
  transaction_type  'credit' | 'debit'
  category          Revenue | Inventory | Rent | Utilities | Salary |
                    Marketing | Transportation | Loan Payment | Miscellaneous
  merchant          Counterparty / vendor name
  description       Free-text description
  timestamp         Optional datetime (for ordering within same date)
  created_at        Row creation timestamp (from TimestampMixin)
  updated_at        Row update timestamp  (from TimestampMixin)
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.business import Business

# Valid category values — used for validation and display
TRANSACTION_CATEGORIES = [
    "Revenue",
    "Inventory",
    "Rent",
    "Utilities",
    "Salary",
    "Marketing",
    "Transportation",
    "Loan Payment",
    "Miscellaneous",
]

# Valid transaction type values
TRANSACTION_TYPES = ["credit", "debit"]


class Transaction(UUIDMixin, TimestampMixin, Base):
    """
    Financial transaction record for an MSME business.
    Supports CSV-uploaded and manually created transactions.
    Part 03 — FT-05 MSME Expense Analytics Engine.
    """

    __tablename__ = "transactions"

    business_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # When the real-world transaction occurred
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # Always positive; direction encoded in transaction_type
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    # 'credit' = money in, 'debit' = money out
    transaction_type: Mapped[str] = mapped_column(String(10), nullable=False)

    # Deterministic category (keyword-based, no LLM)
    category: Mapped[str] = mapped_column(
        String(100), nullable=False, default="Miscellaneous"
    )

    # Counterparty / vendor (from CSV 'merchant' column)
    merchant: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Free-text description (from CSV 'description' column)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Optional precise datetime (for intra-day ordering)
    timestamp: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Many-to-one: each transaction belongs to one business
    business: Mapped["Business"] = relationship(  # noqa: F821
        "Business", back_populates="transactions"
    )
