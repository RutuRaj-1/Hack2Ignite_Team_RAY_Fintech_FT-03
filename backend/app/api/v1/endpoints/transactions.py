"""
FINBRIDGE — Transactions Endpoints (Part 03)
POST /transactions/upload — CSV ingestion
GET  /transactions/        — paginated list

Both endpoints require authentication and verify business ownership.
"""

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.transaction import TransactionListResponse, UploadSummary
from app.services.business import BusinessService
from app.services.transaction import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


async def _require_business(current_user: User, db: AsyncSession):
    """Helper: fetch the business for the current user or raise 404."""
    biz_service = BusinessService(db)
    business = await biz_service.get_by_user_id(current_user.id)
    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found. Please complete onboarding first.",
        )
    return business


@router.post(
    "/upload",
    response_model=UploadSummary,
    status_code=status.HTTP_200_OK,
    summary="Upload transactions via CSV",
    description=(
        "Accept a CSV file with columns: date, description, amount, type, merchant. "
        "Validates, normalises, categorises, and bulk-inserts valid rows. "
        "Returns a summary of accepted and rejected rows."
    ),
)
async def upload_transactions(
    file: UploadFile = File(..., description="CSV file to upload"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UploadSummary:
    # 1. Validate file type at HTTP level
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only CSV files are accepted. Please upload a .csv file.",
        )

    # 2. Ensure user has a business profile
    business = await _require_business(current_user, db)

    # 3. Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file is empty.",
        )

    # 4. Delegate to service
    service = TransactionService(db)
    try:
        summary = await service.upload_csv(
            business_id=business.id,
            file_bytes=file_bytes,
            filename=file.filename or "upload.csv",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    await db.commit()
    return summary


@router.get(
    "/",
    response_model=TransactionListResponse,
    summary="List transactions for the authenticated business",
)
async def list_transactions(
    limit: int = Query(default=50, ge=1, le=200, description="Max rows to return"),
    offset: int = Query(default=0, ge=0, description="Rows to skip"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TransactionListResponse:
    business = await _require_business(current_user, db)
    service = TransactionService(db)
    return await service.list_for_business(
        business_id=business.id,
        limit=limit,
        offset=offset,
    )
