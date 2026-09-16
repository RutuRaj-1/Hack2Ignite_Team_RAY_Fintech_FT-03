"""
FINBRIDGE — Government Scheme Model (Part 07)
FT-04: Financing Opportunity Layer
"""

import uuid
from decimal import Decimal

from sqlalchemy import Numeric, String, Text, Uuid, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.scheme_match import SchemeMatch


class GovernmentScheme(UUIDMixin, TimestampMixin, Base):
    """
    Catalog of official government schemes and subsidies (e.g. PMEGP, MUDRA).
    Provides alternative financing opportunities to MSMEs.
    """

    __tablename__ = "government_schemes"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Matching criteria (simplified representations)
    business_type: Mapped[list[str]] = mapped_column(JSON, nullable=False) # e.g. ["Manufacturing", "Services", "Trading", "ALL"]
    minimum_turnover: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    maximum_turnover: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    eligible_locations: Mapped[list[str]] = mapped_column(JSON, nullable=False) # e.g. ["Urban", "Rural", "ALL"]
    
    # Internal representation of other rules (e.g. "Women Entrepreneurs", "SC/ST")
    eligibility_rules: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(50), nullable=False, default="Verified") # Verified, Unverified, Synthetic
    
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # One-to-many: a scheme has many matches across different businesses
    matches: Mapped[list["SchemeMatch"]] = relationship(  # noqa: F821
        "SchemeMatch", back_populates="scheme", cascade="all, delete-orphan"
    )
