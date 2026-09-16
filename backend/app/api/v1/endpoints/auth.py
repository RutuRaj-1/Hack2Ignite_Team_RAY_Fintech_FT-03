"""
FINBRIDGE — Auth Module Router (Stub)
Handles user registration, login, token refresh, logout.
Implementation: Part 02.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register() -> dict:
    """[STUB] Register a new user. Implementation: Part 02."""
    return {"message": "Auth module — coming in Part 02"}


@router.post("/login")
async def login() -> dict:
    """[STUB] Authenticate and return JWT tokens. Implementation: Part 02."""
    return {"message": "Auth module — coming in Part 02"}


@router.post("/refresh")
async def refresh_token() -> dict:
    """[STUB] Refresh an access token. Implementation: Part 02."""
    return {"message": "Auth module — coming in Part 02"}


@router.post("/logout")
async def logout() -> dict:
    """[STUB] Invalidate refresh token. Implementation: Part 02."""
    return {"message": "Auth module — coming in Part 02"}
