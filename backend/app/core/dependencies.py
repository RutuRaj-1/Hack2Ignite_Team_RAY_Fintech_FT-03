"""
FINBRIDGE — FastAPI Auth Dependencies
Provides `get_current_user` dependency for protected endpoints.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.firebase_admin import verify_firebase_token
from app.models.user import User
from app.services.auth import AuthService

_bearer = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency: verify Firebase Bearer token → return DB user.

    Usage:
        @router.get("/protected")
        async def protected(user: User = Depends(get_current_user)):
            ...

    Raises:
        401: Missing, expired, or invalid token.
        404: Token valid but user not yet registered in DB.
    """
    token = credentials.credentials

    # 1. Verify with Firebase
    try:
        decoded = verify_firebase_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    firebase_uid: str = decoded.get("uid", "")

    # 2. Look up user in our DB
    service = AuthService(db)
    user = await service.get_by_firebase_uid(firebase_uid)

    if user is None:
        if firebase_uid.startswith("demo-") or firebase_uid == "demo-msme-user-001":
            user = await service.create_user(
                firebase_uid=firebase_uid,
                name=decoded.get("name", "Demo MSME Owner"),
                email=decoded.get("email", "demo@finbridge.in"),
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found. Please complete registration.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    return user
