"""
FINBRIDGE — Business Module Schemas (Stub)
Pydantic models for business profile request/response.
Full implementation: Part 02.
"""

from pydantic import EmailStr

from app.schemas.common import BaseSchema, TimestampSchema, UUIDSchema


class BusinessCreate(BaseSchema):
    """[STUB] Schema for creating a business profile."""

    business_name: str
    business_type: str | None = None
    gstin: str | None = None
    pan: str | None = None
    annual_turnover: float | None = None


class BusinessResponse(UUIDSchema, TimestampSchema):
    """[STUB] Schema for business profile responses."""

    business_name: str
    business_type: str | None
    gstin: str | None
    kyc_status: str
