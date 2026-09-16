"""
FINBRIDGE — Loan Service (Part 06)
FT-03: Business logic for loan applications, underwriting assessment, and repayment simulation.
"""

from decimal import Decimal
import json
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ml.loan_engine import LoanAssessmentResult, LoanEngine, LoanSimulationResult
from app.models.business import Business
from app.models.loan import LoanApplication, LoanOffer, Repayment
from app.schemas.loan import (
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoanAssessmentResponse,
    LoanOfferResponse,
    LoanSimulationResponse,
)
from app.services.credit import CreditService
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.loan")


def _offer_to_response(offer: LoanOffer) -> LoanOfferResponse:
    try:
        explanation = json.loads(offer.explanation or "{}")
    except Exception:
        explanation = {}

    return LoanOfferResponse(
        id=offer.id,
        loan_application_id=offer.loan_application_id,
        recommended_min_amount=float(offer.recommended_min_amount),
        recommended_max_amount=float(offer.recommended_max_amount),
        estimated_emi=float(offer.estimated_emi),
        estimated_interest=float(offer.estimated_interest),
        risk_level=offer.risk_level,
        explanation=explanation,
        created_at=offer.created_at,
    )


def _app_to_response(app: LoanApplication) -> LoanApplicationResponse:
    offers: list[LoanOfferResponse] = []
    if "offers" in app.__dict__ and app.offers:
        offers = [_offer_to_response(o) for o in app.offers]
    return LoanApplicationResponse(
        id=app.id,
        business_id=app.business_id,
        requested_amount=float(app.requested_amount),
        tenure_months=app.tenure_months,
        purpose=app.purpose,
        status=app.status,
        created_at=app.created_at,
        offers=offers,
    )


class LoanService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = LoanEngine()

    async def apply_for_loan(
        self,
        business_id: uuid.UUID,
        payload: LoanApplicationCreate,
    ) -> LoanApplicationResponse:
        """
        Creates a new loan application in 'draft' status.
        """
        app = LoanApplication(
            business_id=business_id,
            requested_amount=Decimal(str(payload.requested_amount)),
            tenure_months=payload.tenure_months,
            purpose=payload.purpose.strip(),
            status="draft",
        )
        self.db.add(app)
        await self.db.commit()
        await self.db.refresh(app)
        return _app_to_response(app)

    async def assess_loan(
        self,
        business_id: uuid.UUID,
        application_id: uuid.UUID | None = None,
        requested_amount: float | None = None,
        tenure_months: int | None = None,
        purpose: str | None = None,
    ) -> LoanAssessmentResponse:
        """
        Evaluates a loan request against the business's FT-03 Financial Trust Score,
        monthly cash flow, expense discipline, and fraud telemetry.
        Persists a LoanOffer if tied to a LoanApplication.
        """
        # 1. Fetch or generate CreditProfile
        credit_service = CreditService(self.db)
        credit_profile = await credit_service.get_latest_profile(
            business_id, auto_assess_if_missing=True
        )

        trust_score = credit_profile.trust_score if credit_profile else 50
        metrics = credit_profile.metrics if credit_profile else None

        net_cash_flow = metrics.net_cash_flow if metrics else 0.0
        avg_monthly_revenue = metrics.avg_monthly_revenue if metrics else 0.0
        expense_ratio = metrics.expense_ratio if metrics else 0.0
        repayment_capacity = metrics.repayment_capacity if metrics else 0.0
        fraud_alert_rate = metrics.fraud_alert_rate if metrics else 0.0

        # 2. Check if tied to existing application
        app: LoanApplication | None = None
        if application_id:
            stmt = select(LoanApplication).where(
                LoanApplication.id == application_id,
                LoanApplication.business_id == business_id,
            )
            result = await self.db.execute(stmt)
            app = result.scalar_one_or_none()
            if not app:
                raise ValueError(f"Loan application {application_id} not found")

            # Default parameters from application if not explicitly overridden
            if requested_amount is None:
                requested_amount = float(app.requested_amount)
            if tenure_months is None:
                tenure_months = app.tenure_months
            if purpose is None:
                purpose = app.purpose

        req_amt = float(requested_amount or 50000.0)
        tenure = int(tenure_months or 12)
        purp = str(purpose or "Working Capital")

        # 3. Execute loan assessment logic
        assessment: LoanAssessmentResult = self.engine.assess_loan(
            requested_amount=req_amt,
            tenure_months=tenure,
            purpose=purp,
            trust_score=trust_score,
            net_cash_flow=net_cash_flow,
            avg_monthly_revenue=avg_monthly_revenue,
            expense_ratio=expense_ratio,
            repayment_capacity=repayment_capacity,
            fraud_alert_rate=fraud_alert_rate,
        )

        # 4. If application exists, persist LoanOffer
        offer_id: uuid.UUID | None = None
        if app:
            explanation_data = {
                "supporting_factors": assessment.supporting_factors,
                "caution_factors": assessment.caution_factors,
                "prototype_recommendation": assessment.prototype_recommendation,
                "is_overborrowing_risk": assessment.is_overborrowing_risk,
                "repayment_burden_pct": assessment.repayment_burden_pct,
                "annual_interest_rate": assessment.annual_interest_rate,
                "total_repayment": assessment.total_repayment,
                "metrics": assessment.detailed_metrics,
            }

            offer = LoanOffer(
                loan_application_id=app.id,
                recommended_min_amount=Decimal(str(assessment.recommended_min_amount)),
                recommended_max_amount=Decimal(str(assessment.recommended_max_amount)),
                estimated_emi=Decimal(str(assessment.estimated_emi)),
                estimated_interest=Decimal(str(assessment.estimated_interest)),
                risk_level=assessment.risk_level,
                explanation=json.dumps(explanation_data),
            )
            self.db.add(offer)
            app.status = "offered"
            await self.db.commit()
            await self.db.refresh(offer)
            offer_id = offer.id

        return LoanAssessmentResponse(
            application_id=app.id if app else None,
            offer_id=offer_id,
            recommended_min_amount=assessment.recommended_min_amount,
            recommended_max_amount=assessment.recommended_max_amount,
            requested_amount=assessment.requested_amount,
            tenure_months=assessment.tenure_months,
            annual_interest_rate=assessment.annual_interest_rate,
            estimated_emi=assessment.estimated_emi,
            estimated_interest=assessment.estimated_interest,
            total_repayment=assessment.total_repayment,
            risk_level=assessment.risk_level,
            current_monthly_cash_flow=assessment.current_monthly_cash_flow,
            post_loan_projected_surplus=assessment.post_loan_projected_surplus,
            repayment_burden_pct=assessment.repayment_burden_pct,
            is_overborrowing_risk=assessment.is_overborrowing_risk,
            prototype_recommendation=assessment.prototype_recommendation,
            supporting_factors=assessment.supporting_factors,
            caution_factors=assessment.caution_factors,
        )

    async def simulate_loan(
        self,
        business_id: uuid.UUID,
        loan_amount: float,
        tenure_months: int,
        annual_interest_rate: float | None = None,
    ) -> LoanSimulationResponse:
        """
        Dynamically simulates a loan scenario using real business telemetry.
        """
        credit_service = CreditService(self.db)
        credit_profile = await credit_service.get_latest_profile(
            business_id, auto_assess_if_missing=True
        )

        trust_score = credit_profile.trust_score if credit_profile else 65
        net_cash_flow = (
            credit_profile.metrics.net_cash_flow if credit_profile else 40000.0
        )
        fraud_alert_rate = (
            credit_profile.metrics.fraud_alert_rate if credit_profile else 0.0
        )

        sim: LoanSimulationResult = self.engine.simulate(
            loan_amount=loan_amount,
            tenure_months=tenure_months,
            annual_interest_rate=annual_interest_rate,
            trust_score=trust_score,
            net_cash_flow=net_cash_flow,
            fraud_alert_rate=fraud_alert_rate,
        )

        return LoanSimulationResponse(
            loan_amount=sim.loan_amount,
            tenure_months=sim.tenure_months,
            annual_interest_rate=sim.annual_interest_rate,
            emi=sim.emi,
            total_interest=sim.total_interest,
            total_repayment=sim.total_repayment,
            current_cash_flow=sim.current_cash_flow,
            post_loan_cash_flow=sim.post_loan_cash_flow,
            repayment_burden_pct=sim.repayment_burden_pct,
            is_overborrowing_risk=sim.is_overborrowing_risk,
            risk_level=sim.risk_level,
            cautions=sim.cautions,
        )

    async def list_applications(
        self, business_id: uuid.UUID
    ) -> list[LoanApplicationResponse]:
        """
        Lists all loan applications and associated offers for a business.
        """
        stmt = (
            select(LoanApplication)
            .where(LoanApplication.business_id == business_id)
            .options(selectinload(LoanApplication.offers))
            .order_by(LoanApplication.created_at.desc())
        )
        result = await self.db.execute(stmt)
        apps = result.scalars().all()
        return [_app_to_response(a) for a in apps]

    async def get_application(
        self, business_id: uuid.UUID, application_id: uuid.UUID
    ) -> LoanApplicationResponse | None:
        """
        Fetches an individual application with offers.
        """
        stmt = (
            select(LoanApplication)
            .where(
                LoanApplication.id == application_id,
                LoanApplication.business_id == business_id,
            )
            .options(selectinload(LoanApplication.offers))
        )
        result = await self.db.execute(stmt)
        app = result.scalar_one_or_none()
        return _app_to_response(app) if app else None
