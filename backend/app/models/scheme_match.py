"""
FINBRIDGE — Scheme Match Model (Part 07)
FT-04: Financing Opportunity Layer
"""

import uuid

from sqlalchemy import ForeignKey, Integer, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.government_scheme import GovernmentScheme


class SchemeMatch(UUIDMixin, TimestampMixin, Base):
    """
    Result of the fuzzy matching engine comparing a business profile 
    to a government scheme. Stores the match score and reasons.
    """

    __tablename__ = "scheme_matches"

    business_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    scheme_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("government_schemes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    match_percentage: Mapped[int] = mapped_column(Integer, nullable=False, default=0) # 0 to 100
    
    # JSON lists of string reasons
    matched_conditions: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    unmet_conditions: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    # Back-reference to business
    business: Mapped["Business"] = relationship(  # noqa: F821
        "Business", back_populates="scheme_matches"
    )

    # Back-reference to scheme
    scheme: Mapped["GovernmentScheme"] = relationship(  # noqa: F821
        "GovernmentScheme", back_populates="matches"
    )
