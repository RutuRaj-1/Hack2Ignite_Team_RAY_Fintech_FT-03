"""
FINBRIDGE — FraudAlert Model (Part 04)
Stores risk signals produced by the FT-02 hybrid fraud engine.

This table is signal-only — it never rejects a borrower.
Signals are later consumed by the FT-03 credit engine.

Fields:
  id               UUID primary key
  transaction_id   FK → transactions.id (the analyzed transaction)
  business_id      FK → businesses.id  (for per-business queries)
  risk_score       Integer 0-100
  risk_level       "LOW" | "MEDIUM" | "HIGH"
  detected_reasons JSON list of {rule_name, severity, reason}
  model_type       "rule_engine" | "hybrid"
  status           "open" | "reviewed" | "dismissed"
  created_at / updated_at  from TimestampMixin
"""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.transaction import Transaction


# Valid risk level values
RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"]

# Valid status values
ALERT_STATUSES = ["open", "reviewed", "dismissed"]

# Valid model type values
MODEL_TYPES = ["rule_engine", "hybrid"]


class FraudAlert(UUIDMixin, TimestampMixin, Base):
    """
    Risk signal generated for a single transaction by the FT-02 fraud engine.

    risk_score:       0–100 integer (see FraudEngine for formula)
    risk_level:       LOW (0-39) | MEDIUM (40-69) | HIGH (70-100)
    detected_reasons: JSON-serialised list of triggered rule results
    model_type:       "rule_engine" when <10 history rows (IF skipped)
                      "hybrid" when Isolation Forest also contributed
    status:           "open" until a human reviews/dismisses
    """

    __tablename__ = "fraud_alerts"
    __table_args__ = (
        # Fast lookup: all alerts for a business ordered by recency
        Index("idx_fraud_business_created", "business_id", "created_at"),
        # Fast lookup: alert for a specific transaction
        Index("idx_fraud_transaction", "transaction_id"),
        # Fast lookup: all open HIGH-risk alerts
        Index("idx_fraud_level_status", "risk_level", "status"),
    )

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
    )

    business_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # "LOW" | "MEDIUM" | "HIGH"
    risk_level: Mapped[str] = mapped_column(
        String(10), nullable=False, default="LOW"
    )

    # JSON string: list of {rule_name, severity, reason}
    detected_reasons: Mapped[str] = mapped_column(
        Text, nullable=False, default="[]"
    )

    # "rule_engine" | "hybrid"
    model_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="rule_engine"
    )

    # "open" | "reviewed" | "dismissed"
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="open"
    )

    # Relationships
    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="fraud_alert"
    )
    business: Mapped["Business"] = relationship(
        "Business", back_populates="fraud_alerts"
    )
