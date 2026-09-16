"""FINBRIDGE — models package.
Import all models here so SQLAlchemy metadata is fully populated
before table creation or Alembic migration generation.
"""

from app.models.base import TimestampMixin, UUIDMixin  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.business import Business  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.fraud_alert import FraudAlert  # noqa: F401

# Part 02 core models: User, Business
# Part 03 models: Transaction (FT-05)
# Part 04 models: FraudAlert (FT-02)
