"""
FINBRIDGE — Transactions Module Router (Stub)
Financial transaction ingestion and retrieval.
Maps to: FT-05 (MSME expense analytics).
Implementation: Part 02.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/")
async def create_transaction() -> dict:
    """[STUB] Ingest a new transaction record. Implementation: Part 02."""
    return {"message": "Transactions module — coming in Part 02"}


@router.get("/")
async def list_transactions() -> dict:
    """[STUB] List transactions with filters. Implementation: Part 02."""
    return {"message": "Transactions module — coming in Part 02"}


@router.post("/bulk")
async def bulk_upload_transactions() -> dict:
    """[STUB] Bulk upload transactions (CSV/JSON). Implementation: Part 02."""
    return {"message": "Transactions module — coming in Part 02"}
