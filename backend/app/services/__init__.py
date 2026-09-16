"""
FINBRIDGE — Service Stubs
One service stub per module. All raise NotImplementedError.
Full service implementations: Part 02.
"""


class AuthService:
    """Handles user registration, authentication, and token management."""

    async def register(self) -> None:
        raise NotImplementedError("AuthService.register — Part 02")

    async def login(self) -> None:
        raise NotImplementedError("AuthService.login — Part 02")


class BusinessService:
    """Manages MSME business profiles and KYC."""

    async def create_profile(self) -> None:
        raise NotImplementedError("BusinessService.create_profile — Part 02")

    async def get_profile(self) -> None:
        raise NotImplementedError("BusinessService.get_profile — Part 02")


class TransactionService:
    """Handles transaction ingestion, categorization, and retrieval."""

    async def create(self) -> None:
        raise NotImplementedError("TransactionService.create — Part 02")

    async def list_for_business(self) -> None:
        raise NotImplementedError("TransactionService.list_for_business — Part 02")


class AnalyticsService:
    """Produces financial analytics and dashboard data."""

    async def get_summary(self) -> None:
        raise NotImplementedError("AnalyticsService.get_summary — Part 02")

    async def get_cashflow(self) -> None:
        raise NotImplementedError("AnalyticsService.get_cashflow — Part 02")


class FraudService:
    """Detects fraud signals and manages risk profiles. FT-02."""

    async def scan_transaction(self) -> None:
        raise NotImplementedError("FraudService.scan_transaction — Part 03")

    async def get_risk_profile(self) -> None:
        raise NotImplementedError("FraudService.get_risk_profile — Part 03")


class CreditService:
    """Alternative credit scoring pipeline. Core FT-03."""

    async def generate_score(self) -> None:
        raise NotImplementedError("CreditService.generate_score — Part 03")

    async def get_score(self) -> None:
        raise NotImplementedError("CreditService.get_score — Part 03")


class LoanService:
    """Manages loan application lifecycle. FT-03."""

    async def apply(self) -> None:
        raise NotImplementedError("LoanService.apply — Part 02")

    async def get_loan(self) -> None:
        raise NotImplementedError("LoanService.get_loan — Part 02")


class SchemeService:
    """Discovers and matches government schemes. FT-04."""

    async def list_schemes(self) -> None:
        raise NotImplementedError("SchemeService.list_schemes — Part 02")

    async def match(self) -> None:
        raise NotImplementedError("SchemeService.match — Part 02")


class CoachService:
    """AI financial literacy coach. FT-01."""

    async def chat(self) -> None:
        raise NotImplementedError("CoachService.chat — Part 03")

    async def get_tips(self) -> None:
        raise NotImplementedError("CoachService.get_tips — Part 03")
