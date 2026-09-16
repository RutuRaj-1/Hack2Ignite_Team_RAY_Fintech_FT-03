"""
FINBRIDGE — Health Check Endpoint
GET /health — Liveness probe for the API.
"""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """
    Liveness probe.

    Returns a simple status object confirming the API is running.
    """
    return {
        "status": "ok",
        "service": "finbridge-api",
    }
