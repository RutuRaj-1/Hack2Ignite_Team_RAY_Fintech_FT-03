"""
FINBRIDGE — AI Financial Coach Module Router (Stub)
Financial literacy guidance and AI-powered coaching.
Maps to: FT-01 (financial literacy).
Implementation: Part 03 (LLM integration).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/coach", tags=["coach"])


@router.post("/chat")
async def chat_with_coach() -> dict:
    """[STUB] Send message to AI financial coach. Implementation: Part 03."""
    return {"message": "Coach module — coming in Part 03"}


@router.get("/tips/{business_id}")
async def get_financial_tips(business_id: str) -> dict:
    """[STUB] Get personalized financial tips. Implementation: Part 03."""
    return {"message": "Coach module — coming in Part 03"}


@router.get("/lessons")
async def list_lessons() -> dict:
    """[STUB] List financial literacy lesson modules. Implementation: Part 03."""
    return {"message": "Coach module — coming in Part 03"}


@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str) -> dict:
    """[STUB] Get a specific lesson. Implementation: Part 03."""
    return {"message": "Coach module — coming in Part 03"}
