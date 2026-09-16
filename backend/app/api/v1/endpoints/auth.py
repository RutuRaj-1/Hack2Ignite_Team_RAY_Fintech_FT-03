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

    # 2. Check for existing user (duplicate email or uid)
    existing = await service.get_by_firebase_uid(firebase_uid)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this Firebase UID already exists.",
        )

    existing_email = await service.get_by_email(body.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please complete registration first.",
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
