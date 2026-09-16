"""
FINBRIDGE — Scheme Match Schemas (Part 07)
FT-04: Financing Opportunity Layer
"""

import uuid
from decimal import Decimal
from pydantic import ConfigDict

from app.schemas.common import BaseSchema


class GovernmentSchemeResponse(BaseSchema):
    """Schema for a single government scheme."""
    model_config = ConfigDict(protected_namespaces=())

    id: uuid.UUID
    name: str
    description: str
    business_type: list[str]
    minimum_turnover: Decimal | None
    maximum_turnover: Decimal | None
    eligible_locations: list[str]
    eligibility_rules: list[str]
    source_url: str
    verification_status: str
    is_active: bool


class SchemeMatchResponse(BaseSchema):
    """Schema for a fuzzy match result."""
    model_config = ConfigDict(protected_namespaces=())

    id: uuid.UUID
    business_id: uuid.UUID
    scheme_id: uuid.UUID
    match_percentage: int
    matched_conditions: list[str]
    unmet_conditions: list[str]
    
    # Nested scheme details
    scheme: GovernmentSchemeResponse


class MatchingResult(BaseSchema):
    """Wrapper for the list of matched schemes."""
    model_config = ConfigDict(protected_namespaces=())

    business_id: uuid.UUID
    total_matches: int
    matches: list[SchemeMatchResponse]
