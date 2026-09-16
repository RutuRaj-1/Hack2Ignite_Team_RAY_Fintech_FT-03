"""
FINBRIDGE — Auth Service (Part 02)
Handles user creation and lookup by Firebase UID.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.auth")


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_firebase_uid(self, firebase_uid: str) -> User | None:
        """Look up a user by their Firebase UID."""
        result = await self.db.execute(
            select(User).where(User.firebase_uid == firebase_uid)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        """Look up a user by email address."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> User | None:
        """Look up a user by UUID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_user(
        self,
        *,
        firebase_uid: str,
        name: str,
        email: str,
    ) -> User:
        """
        Create a new user record in our database.
        Called after Firebase successfully creates the account on the client.
        """
        user = User(
            firebase_uid=firebase_uid,
            name=name,
            email=email,
        )
        self.db.add(user)
        await self.db.flush()   # Get the generated ID without committing
        await self.db.refresh(user)
        logger.info("User created", user_id=str(user.id), email=email)
        return user
