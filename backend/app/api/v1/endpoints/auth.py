"""
FINBRIDGE — Auth Endpoints (Part 02)
POST /auth/register  — register user in our DB post-Firebase sign-up
POST /auth/login     — verify Firebase token, return user info
GET  /auth/me        — return current authenticated user
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.firebase_admin import verify_firebase_token
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register user in FINBRIDGE database",
    description=(
        "Call this **after** Firebase creates the account on the client. "
        "Pass the Firebase ID token + user details. Returns the created user."
    ),
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    # 1. Verify Firebase token
    try:
        decoded = verify_firebase_token(body.firebase_id_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    firebase_uid: str = decoded["uid"]
    service = AuthService(db)

    # 2. Check for existing user (duplicate email or uid) - idempotent handling
    existing = await service.get_by_firebase_uid(firebase_uid)
    if existing:
        return AuthResponse(user=UserResponse.from_user(existing), message="Account already registered.")

    existing_email = await service.get_by_email(body.email)
    if existing_email:
        existing_email.firebase_uid = firebase_uid
        if body.name:
            existing_email.name = body.name
        await db.commit()
        await db.refresh(existing_email)
        return AuthResponse(user=UserResponse.from_user(existing_email), message="Account synced successfully.")

    # 3. Create user
    user = await service.create_user(
        firebase_uid=firebase_uid,
        name=body.name,
        email=body.email,
    )

    return AuthResponse(user=UserResponse.from_user(user), message="Account created successfully.")


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Verify Firebase token and return user info",
    description=(
        "Pass the Firebase ID token obtained from `getIdToken()`. "
        "Returns the user record from the FINBRIDGE database."
    ),
)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    # 1. Verify token
    try:
        decoded = verify_firebase_token(body.firebase_id_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    firebase_uid: str = decoded["uid"]

    # 2. Lookup user
    service = AuthService(db)
    user = await service.get_by_firebase_uid(firebase_uid)
    if user is None:
        # Fallback by email if exists
        email = decoded.get("email")
        if email:
            user = await service.get_by_email(email)
            if user:
                user.firebase_uid = firebase_uid
                await db.commit()
                await db.refresh(user)
        # If still not found, auto-provision user from verified Firebase token
        if user is None:
            user_name = decoded.get("name") or (email.split("@")[0] if email else "MSME Owner")
            user_email = email or f"{firebase_uid[:8]}@finbridge.in"
            user = await service.create_user(
                firebase_uid=firebase_uid,
                name=user_name,
                email=user_email,
            )

    return AuthResponse(user=UserResponse.from_user(user), message="Login successful.")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get authenticated user information",
    description="Returns the currently authenticated user's profile.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.from_user(current_user)
