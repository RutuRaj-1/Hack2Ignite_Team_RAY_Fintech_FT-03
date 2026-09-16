"""FINBRIDGE — models package.
Import all models here so SQLAlchemy metadata is fully populated
before table creation or Alembic migration generation.
"""

from app.models.base import TimestampMixin, UUIDMixin  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.business import Business  # noqa: F401

# Part 02 core models: User, Business
# Part 03 models: Loan, Transaction, CreditScore, FraudFlag, Scheme
