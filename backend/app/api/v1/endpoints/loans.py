"""
FINBRIDGE — Loans Module Router (Stub)
Loan application lifecycle: apply, review, disburse, repay.
Maps to: FT-03 (core micro-lending).
Implementation: Part 02.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/loans", tags=["loans"])


@router.post("/apply")
async def apply_for_loan() -> dict:
    """[STUB] Submit a loan application. Implementation: Part 02."""
    return {"message": "Loans module — coming in Part 02"}


@router.get("/{loan_id}")
async def get_loan(loan_id: str) -> dict:
    """[STUB] Retrieve loan details. Implementation: Part 02."""
    return {"message": "Loans module — coming in Part 02"}


@router.get("/")
async def list_loans() -> dict:
    """[STUB] List loans for authenticated business. Implementation: Part 02."""
    return {"message": "Loans module — coming in Part 02"}


@router.post("/{loan_id}/repay")
async def record_repayment(loan_id: str) -> dict:
    """[STUB] Record a loan repayment. Implementation: Part 02."""
    return {"message": "Loans module — coming in Part 02"}


@router.get("/{loan_id}/schedule")
async def get_repayment_schedule(loan_id: str) -> dict:
    """[STUB] Get repayment schedule. Implementation: Part 02."""
    return {"message": "Loans module — coming in Part 02"}
