"""
FINBRIDGE — Financial Coach Service (Part 08)
FT-01: Gathers deterministic backend telemetry into structured JSON and invokes AI service.
"""

from decimal import Decimal
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business import Business
from app.models.credit_profile import CreditProfile
from app.models.loan import LoanApplication, LoanOffer
from app.models.transaction import Transaction
from app.schemas.coach import (
    CoachMessage,
    CoachQueryResponse,
    EducationalCard,
    FinancialContext,
)
from app.services.ai_service import AIService, EDUCATIONAL_CARDS
from app.services.credit import CreditService
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.coach")


class CoachService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()

    async def build_financial_context(
        self, business_id: uuid.UUID
    ) -> FinancialContext:
        """
        Compiles the structured financial context strictly from deterministic records.
        """
        # 1. Fetch Business
        biz_stmt = select(Business).where(Business.id == business_id)
        biz_res = await self.db.execute(biz_stmt)
        business = biz_res.scalar_one_or_none()

        # 2. Fetch Credit Profile
        credit_service = CreditService(self.db)
        credit_profile = await credit_service.get_latest_profile(
            business_id, auto_assess_if_missing=True
        )

        trust_score = credit_profile.trust_score if credit_profile else 50
        metrics = credit_profile.metrics if credit_profile else None

        monthly_rev = metrics.avg_monthly_revenue if metrics else 0.0
        monthly_exp = metrics.avg_monthly_expense if metrics else 0.0
        net_cash = metrics.net_cash_flow if metrics else 0.0
        expense_ratio = metrics.expense_ratio if metrics else 0.0
        active_months = metrics.active_months if metrics else 1

        # 3. Latest Loan details (if available)
        loan_stmt = (
            select(LoanApplication)
            .where(LoanApplication.business_id == business_id)
            .order_by(LoanApplication.created_at.desc())
            .limit(1)
        )
        loan_res = await self.db.execute(loan_stmt)
        latest_loan = loan_res.scalar_one_or_none()

        requested_loan = float(latest_loan.requested_amount) if latest_loan else 0.0
        estimated_emi = 0.0
        projected_surplus = net_cash
        repayment_burden = 0.0

        if latest_loan and latest_loan.offers:
            offer = latest_loan.offers[0]
            estimated_emi = float(offer.estimated_emi)
            projected_surplus = net_cash - estimated_emi
            repayment_burden = (
                (estimated_emi / net_cash * 100.0) if net_cash > 0 else 100.0
            )

        # 4. Fraud risk tier
        fraud_risk = "LOW"
        if metrics and metrics.fraud_alert_rate > 0.20:
            fraud_risk = "HIGH"
        elif metrics and metrics.fraud_alert_rate > 0.05:
            fraud_risk = "MEDIUM"

        return FinancialContext(
            monthly_revenue=round(monthly_rev, 2),
            monthly_expenses=round(monthly_exp, 2),
            net_cash_flow=round(net_cash, 2),
            expense_ratio=round(expense_ratio, 4),
            trust_score=trust_score,
            fraud_risk=fraud_risk,
            requested_loan=round(requested_loan, 2),
            estimated_emi=round(estimated_emi, 2),
            projected_surplus=round(projected_surplus, 2),
            repayment_burden_pct=round(repayment_burden, 1),
            active_months=active_months,
            business_name=business.business_name if business else "MSME Enterprise",
            business_type=business.business_type if business else "General MSME",
        )

    async def ask_coach(
        self,
        business_id: uuid.UUID,
        question: str,
        history: list[CoachMessage] | None = None,
        context_override: FinancialContext | None = None,
    ) -> CoachQueryResponse:
        """
        Coordinates answering a financial literacy or coaching question.
        """
        context = context_override or await self.build_financial_context(business_id)

        answer_text, provider = await self.ai_service.financial_coach(
            question=question,
            context=context,
            history=history or [],
        )

        # Determine relevant educational topic
        q_low = question.lower()
        topic = None
        if "emi" in q_low:
            topic = "EMI"
        elif "cash flow" in q_low:
            topic = "Cash Flow"
        elif "burden" in q_low:
            topic = "Repayment Burden"
        elif "interest" in q_low:
            topic = "Interest"
        elif "score" in q_low:
            topic = "Revenue Consistency"
        elif "expense" in q_low:
            topic = "Expense Management"
        elif "flag" in q_low or "fraud" in q_low:
            topic = "Transaction Risk"

        suggested = [
            "Can I afford a ₹50,000 loan?",
            "Why is my financial trust score low?",
            "How can I improve my cash flow?",
            "What is repayment burden?",
            "What does EMI mean?",
        ]

        return CoachQueryResponse(
            answer=answer_text,
            context_used=context,
            suggested_questions=[s for s in suggested if s.lower() != question.lower()][:4],
            relevant_topic=topic,
            provider_used=provider,
        )

    def get_educational_cards(self) -> list[EducationalCard]:
        """Returns the 7 core financial education cards."""
        return EDUCATIONAL_CARDS
