"""
FINBRIDGE — User Model (Part 02)
Fields: id, name, email, firebase_uid, password_hash, created_at, updated_at.
"""

from __future__ import annotations

from typing import TYPE_CHECKING
from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.business import Business


class User(UUIDMixin, TimestampMixin, Base):
    """
    FINBRIDGE user account.
    firebase_uid links this record to Firebase Auth (unique per user).
    """

    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    # Firebase owns the credential; password_hash stored optionally for reference
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # One-to-one: a user has at most one business profile
    business: Mapped["Business | None"] = relationship(  # noqa: F821
        "Business", back_populates="owner", uselist=False, lazy="selectin"
    )
