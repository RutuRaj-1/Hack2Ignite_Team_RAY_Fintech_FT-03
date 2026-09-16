"""
FINBRIDGE — Common Pydantic Schemas
Shared base types and response envelopes used across all modules.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with common config for all FINBRIDGE schemas."""

    model_config = ConfigDict(
        from_attributes=True,        # Allow ORM model → schema conversion
        populate_by_name=True,
        str_strip_whitespace=True,
    )


class TimestampSchema(BaseSchema):
    """Schema mixin that includes created_at and updated_at."""

    created_at: datetime
    updated_at: datetime


class UUIDSchema(BaseSchema):
    """Schema mixin that includes a UUID id field."""

    id: uuid.UUID


class HealthResponse(BaseSchema):
    """Response shape for GET /health."""

    status: str
    service: str
