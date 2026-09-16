"""
FINBRIDGE — Auth Pydantic Schemas (Part 02)
Request/response models for registration, login, and /auth/me.
"""

import uuid
from datetime import datetime

from pydantic import EmailStr, field_validator

from app.schemas.common import BaseSchema, UUIDSchema


class RegisterRequest(BaseSchema):
    """
    Body for POST /auth/register.
    Firebase has already created the account — this registers the user in our DB.
    """

    firebase_id_token: str  # Token obtained from Firebase after client-side sign-up
    name: str
    email: EmailStr

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty.")
        return v.strip()


class LoginRequest(BaseSchema):
    """
    Body for POST /auth/login.
    The Firebase ID token is all we need — Firebase already authenticated the user.
    """

    firebase_id_token: str


class UserResponse(UUIDSchema):
    """Response shape for an authenticated user."""

    name: str
    email: str
    firebase_uid: str
    is_active: bool
    created_at: datetime
    has_business: bool = False

    @classmethod
    def from_user(cls, user: "User") -> "UserResponse":  # noqa: F821
        has_business = False
        if "business" in user.__dict__ and user.business is not None:
            has_business = True
        return cls(
            id=user.id,
            name=user.name,
            email=user.email,
            firebase_uid=user.firebase_uid,
            is_active=user.is_active,
            created_at=user.created_at,
            has_business=has_business,
        )


class AuthResponse(BaseSchema):
    """Wrapper response for auth endpoints."""

    user: UserResponse
    message: str = "ok"
