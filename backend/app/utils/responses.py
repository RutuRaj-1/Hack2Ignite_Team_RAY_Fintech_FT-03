"""
FINBRIDGE — Standardized API Response Helpers
Ensures all API responses follow a consistent envelope format.
"""

from typing import Any, Generic, TypeVar

from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response envelope."""

    success: bool = True
    message: str = "ok"
    data: T | None = None


class ErrorDetail(BaseModel):
    """Single error detail item."""

    field: str | None = None
    message: str


class ErrorResponse(BaseModel):
    """Standard error response envelope."""

    success: bool = False
    message: str
    errors: list[ErrorDetail] | None = None


def success(
    data: Any = None,
    message: str = "ok",
    status_code: int = status.HTTP_200_OK,
) -> JSONResponse:
    """Return a standardized success JSONResponse."""
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "message": message, "data": data},
    )


def error(
    message: str,
    errors: list[dict[str, str]] | None = None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> JSONResponse:
    """Return a standardized error JSONResponse."""
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "message": message, "errors": errors},
    )
