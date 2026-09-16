"""
FINBRIDGE — Transaction Pydantic Schemas (Part 03)
Request / response shapes for transaction ingestion and retrieval.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.common import BaseSchema


# ---------------------------------------------------------------------------
# Transaction response
# ---------------------------------------------------------------------------


class TransactionResponse(BaseSchema):
    """Single transaction record returned from the API."""

    id: uuid.UUID
    business_id: uuid.UUID
    transaction_date: date
    amount: Decimal
    transaction_type: str   # 'credit' | 'debit'
    category: str
    merchant: str | None
    description: str | None
    timestamp: datetime | None
    created_at: datetime


# ---------------------------------------------------------------------------
# CSV Upload result
# ---------------------------------------------------------------------------


class RowError(BaseModel):
    """Details of a single rejected row during CSV upload."""

    row: int
    reason: str


class UploadSummary(BaseSchema):
    """Returned after POST /transactions/upload."""

    total_rows: int
    accepted_rows: int
    rejected_rows: int
    errors: list[RowError]
    message: str


# ---------------------------------------------------------------------------
# List response
# ---------------------------------------------------------------------------


class TransactionListResponse(BaseSchema):
    """Paginated list of transactions."""

    transactions: list[TransactionResponse]
    total: int
    limit: int
    offset: int
