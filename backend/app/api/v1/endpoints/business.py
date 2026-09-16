"""
FINBRIDGE — Business Profile Endpoints (Part 02)
POST /business/profile  — create business profile (authenticated, 409 if exists)
GET  /business/profile  — get own business profile
PUT  /business/profile  — update own business profile
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from app.services.business import BusinessService

router = APIRouter(prefix="/business", tags=["business"])


@router.post(
    "/profile",
    response_model=BusinessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create business profile",
    description=(
        "Create an MSME business profile for the authenticated user. "
        "Each user can have only one profile (409 if already exists)."
    ),
)
async def create_business_profile(
    body: BusinessCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BusinessResponse:
    service = BusinessService(db)

    # Enforce one profile per user
    existing = await service.get_by_user_id(current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A business profile already exists for this account. Use PUT to update.",
        )

    business = await service.create(user_id=current_user.id, data=body)
    return BusinessResponse.model_validate(business)


@router.get(
    "/profile",
    response_model=BusinessResponse,
    summary="Get own business profile",
    description="Returns the authenticated user's business profile.",
)
async def get_business_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BusinessResponse:
    service = BusinessService(db)
    business = await service.get_by_user_id(current_user.id)

    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found. Please create one first.",
        )

    return BusinessResponse.model_validate(business)


@router.put(
    "/profile",
    response_model=BusinessResponse,
    summary="Update own business profile",
    description=(
        "Partially update the authenticated user's business profile. "
        "Only provided fields are updated."
    ),
)
async def update_business_profile(
    body: BusinessUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BusinessResponse:
    service = BusinessService(db)
    business = await service.get_by_user_id(current_user.id)

    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business profile found. Please create one first.",
        )

    updated = await service.update(business=business, data=body)
    return BusinessResponse.model_validate(updated)
