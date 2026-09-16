"""
FINBRIDGE — Security Utilities (Stub)
JWT token creation and verification will be implemented in Part 02.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

# Placeholder — will use python-jose in Part 02
# from jose import JWTError, jwt
# from passlib.context import CryptContext
# from app.core.config import get_settings


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """
    Create a signed JWT access token.
    [STUB] — Implementation in Part 02 (Auth module).
    """
    raise NotImplementedError("JWT auth will be implemented in Part 02.")


def verify_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT token.
    [STUB] — Implementation in Part 02 (Auth module).
    """
    raise NotImplementedError("JWT verification will be implemented in Part 02.")


def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    [STUB] — Implementation in Part 02 (Auth module).
    """
    raise NotImplementedError("Password hashing will be implemented in Part 02.")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a bcrypt hash.
    [STUB] — Implementation in Part 02 (Auth module).
    """
    raise NotImplementedError("Password verification will be implemented in Part 02.")
