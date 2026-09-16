"""FINBRIDGE — models package.
Import all models here so SQLAlchemy metadata is fully populated
before table creation or Alembic migration generation.
"""

from app.models.base import TimestampMixin, UUIDMixin  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.business import Business  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.fraud_alert import FraudAlert  # noqa: F401
from app.models.credit_profile import CreditProfile  # noqa: F401
from app.models.loan import LoanApplication, LoanOffer, Repayment  # noqa: F401
from app.models.government_scheme import GovernmentScheme  # noqa: F401
from app.models.scheme_match import SchemeMatch  # noqa: F401

__all__ = [
    "User",
    "Business",
    "Transaction",
    "FraudAlert",
    "CreditProfile",
    "LoanApplication",
    "LoanOffer",
    "Repayment",
    "GovernmentScheme",
    "SchemeMatch",
]

# Part 03 models: Transaction (FT-05)
# Part 04 models: FraudAlert (FT-02)
# Part 05 models: CreditProfile (FT-03)
# Part 06 models: LoanApplication, LoanOffer, Repayment (FT-03 Core)
