"""
FINBRIDGE — Business Profile Pydantic Schemas (Part 02)
Request/response models for business CRUD.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import field_validator

from app.schemas.common import BaseSchema, UUIDSchema


class BusinessCreate(BaseSchema):
    """Body for POST /business/profile."""

    business_name: str
    business_type: str | None = None
    location: str | None = None
    business_age: int | None = None         # years in operation
    annual_turnover: Decimal | None = None  # INR

    @field_validator("business_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Business name cannot be empty.")
        return v.strip()

    @field_validator("business_age")
    @classmethod
    def age_positive(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("Business age must be zero or positive.")
        return v

    @field_validator("annual_turnover")
    @classmethod
    def turnover_positive(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("Annual turnover must be non-negative.")
        return v


class BusinessUpdate(BaseSchema):
    """Body for PUT /business/profile — all fields optional."""

    business_name: str | None = None
    business_type: str | None = None
    location: str | None = None
    business_age: int | None = None
    annual_turnover: Decimal | None = None


class BusinessResponse(UUIDSchema):
    """Response shape for a business profile."""

    user_id: uuid.UUID
    business_name: str
    business_type: str | None
    location: str | None
    business_age: int | None
    annual_turnover: Decimal | None
    created_at: datetime
    updated_at: datetime
