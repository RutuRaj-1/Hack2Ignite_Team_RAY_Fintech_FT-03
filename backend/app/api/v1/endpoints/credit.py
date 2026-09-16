"""
FINBRIDGE — Credit Module Router (Stub)
Alternative credit scoring — core FT-03 deliverable.
Uses alternative data: UPI transactions, GST filings, utility bills.
Implementation: Part 02 / Part 03 (ML pipeline).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/credit", tags=["credit"])


@router.post("/score/{business_id}")
async def generate_credit_score(business_id: str) -> dict:
    """[STUB] Generate alternative credit score. Implementation: Part 03."""
    return {"message": "Credit module — coming in Part 03"}


@router.get("/score/{business_id}")
async def get_credit_score(business_id: str) -> dict:
    """[STUB] Retrieve latest credit score. Implementation: Part 03."""
    return {"message": "Credit module — coming in Part 03"}


@router.get("/history/{business_id}")
async def get_score_history(business_id: str) -> dict:
    """[STUB] Get credit score history. Implementation: Part 03."""
    return {"message": "Credit module — coming in Part 03"}


@router.get("/factors/{business_id}")
async def get_score_factors(business_id: str) -> dict:
    """[STUB] Get explainable score factors. Implementation: Part 03."""
    return {"message": "Credit module — coming in Part 03"}
