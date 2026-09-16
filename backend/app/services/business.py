"""
FINBRIDGE — Business Service (Part 02)
Handles business profile CRUD — enforces one profile per user.
"""

import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.business import Business
from app.schemas.business import BusinessCreate, BusinessUpdate
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.business")


class BusinessService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_user_id(self, user_id: uuid.UUID) -> Business | None:
        """Retrieve the business profile for a given user."""
        result = await self.db.execute(
            select(Business).where(Business.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: uuid.UUID, data: BusinessCreate) -> Business:
        """
        Create a business profile for the authenticated user.
        Caller must check for existing profile first (409 Conflict if exists).
        """
        business = Business(
            user_id=user_id,
            business_name=data.business_name,
            business_type=data.business_type,
            location=data.location,
            business_age=data.business_age,
            annual_turnover=float(data.annual_turnover) if data.annual_turnover is not None else None,
        )
        self.db.add(business)
        await self.db.flush()
        await self.db.refresh(business)
        logger.info("Business profile created", business_id=str(business.id), user_id=str(user_id))
        return business

    async def update(self, business: Business, data: BusinessUpdate) -> Business:
        """
        Update only the provided fields (partial update).
        """
        if data.business_name is not None:
            business.business_name = data.business_name
        if data.business_type is not None:
            business.business_type = data.business_type
        if data.location is not None:
            business.location = data.location
        if data.business_age is not None:
            business.business_age = data.business_age
        if data.annual_turnover is not None:
            business.annual_turnover = float(data.annual_turnover)

        await self.db.flush()
        await self.db.refresh(business)
        logger.info("Business profile updated", business_id=str(business.id))
        return business
