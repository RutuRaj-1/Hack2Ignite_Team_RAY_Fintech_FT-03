"""
FINBRIDGE — Loan Engine & Amortization Math (Part 06)
FT-03: Core Micro-Lending Assessment, EMI & Simulation Engine.

Provides:
  - Exact reducing-balance EMI & Amortization calculation
  - Prototype loan eligibility assessment based on Financial Trust Score & Cash Flow
  - Over-borrowing risk detection & explainability cautions
  - Dynamic loan scenario simulation
"""

from dataclasses import dataclass, field
import math
from typing import Any


@dataclass(frozen=True)
class EmiResult:
    """Mathematical EMI calculation result."""
    principal: float
    annual_interest_rate: float
    tenure_months: int
    monthly_interest_rate: float
    emi: float
    total_repayment: float
    total_interest: float


@dataclass
class LoanAssessmentResult:
    """Full assessment result with prototype recommendation and explainability."""
    recommended_min_amount: float
    recommended_max_amount: float
    requested_amount: float
    tenure_months: int
    annual_interest_rate: float
    estimated_emi: float
    estimated_interest: float
    total_repayment: float
    risk_level: str  # "LOW" | "MEDIUM" | "HIGH"
    current_monthly_cash_flow: float
    post_loan_projected_surplus: float
    repayment_burden_pct: float
    is_overborrowing_risk: bool
    prototype_recommendation: str
    supporting_factors: list[str] = field(default_factory=list)
    caution_factors: list[str] = field(default_factory=list)
    detailed_metrics: dict[str, Any] = field(default_factory=dict)


@dataclass
class LoanSimulationResult:
    """Result for real-time slider/input loan simulations."""
    loan_amount: float
    tenure_months: int
    annual_interest_rate: float
    emi: float
    total_interest: float
    total_repayment: float
    current_cash_flow: float
    post_loan_cash_flow: float
    repayment_burden_pct: float
    is_overborrowing_risk: bool
    risk_level: str
    cautions: list[str] = field(default_factory=list)


class LoanEngine:
    """
    Deterministic loan calculation and underwriting recommendation engine.
    """

    @staticmethod
    def calculate_emi(
        principal: float,
        annual_interest_rate: float,
        tenure_months: int,
    ) -> EmiResult:
        """
        Calculates reducing-balance monthly installment (EMI):
        E = P * r * (1 + r)^n / ((1 + r)^n - 1)
        where r = annual_interest_rate / 12 / 100, n = tenure_months.
        """
        p = max(0.0, float(principal))
        n = max(1, int(tenure_months))
        r = (annual_interest_rate / 12.0 / 100.0) if annual_interest_rate > 0 else 0.0

        if p == 0:
            return EmiResult(
                principal=0.0,
                annual_interest_rate=annual_interest_rate,
                tenure_months=n,
                monthly_interest_rate=r,
                emi=0.0,
                total_repayment=0.0,
                total_interest=0.0,
            )

        if r == 0:
            emi = p / n
            total_repayment = p
            total_interest = 0.0
        else:
            pow_factor = math.pow(1.0 + r, n)
            emi = p * r * pow_factor / (pow_factor - 1.0)
            total_repayment = emi * n
            total_interest = total_repayment - p

        return EmiResult(
            principal=round(p, 2),
            annual_interest_rate=round(annual_interest_rate, 2),
            tenure_months=n,
            monthly_interest_rate=round(r, 6),
            emi=round(emi, 2),
            total_repayment=round(total_repayment, 2),
            total_interest=round(max(0.0, total_interest), 2),
        )

    @staticmethod
    def determine_rate_and_risk(
        trust_score: int, fraud_alert_rate: float = 0.0
    ) -> tuple[float, str]:
        """
        Maps Financial Trust Score and risk signals to prototype interest rates.
        Prototype assumption:
          80-100 score + clean fraud -> LOW risk, 12.0% p.a.
          65-79 score + low fraud    -> MEDIUM risk, 14.5% p.a.
          50-64 score + mod fraud    -> MEDIUM risk, 17.5% p.a.
          <50 score or high fraud    -> HIGH risk, 21.0% p.a.
        """
        if fraud_alert_rate >= 0.20 or trust_score < 40:
            return 21.0, "HIGH"
        if trust_score >= 80 and fraud_alert_rate == 0.0:
            return 12.0, "LOW"
        if trust_score >= 65 and fraud_alert_rate <= 0.05:
            return 14.5, "MEDIUM"
        if trust_score >= 50 and fraud_alert_rate <= 0.15:
            return 17.5, "MEDIUM"
        return 21.0, "HIGH"

    @classmethod
    def calculate_recommended_range(
        cls,
        trust_score: int,
        net_cash_flow: float,
        avg_monthly_revenue: float,
        tenure_months: int,
        annual_interest_rate: float,
    ) -> tuple[float, float]:
        """
        Calculates sustainable loan recommendation range [min, max].
        Safe lending threshold: EMI should not exceed 35% of monthly net cash flow
        and should not exceed 20% of monthly turnover.
        """
        if net_cash_flow <= 0 or avg_monthly_revenue <= 0:
            # For negative or zero cash flow businesses
            if trust_score >= 65:
                return 10000.0, 25000.0  # Conservative starter line
            return 0.0, 0.0

        n = max(1, tenure_months)
        r = annual_interest_rate / 12.0 / 100.0

        # Safe sustainable EMI ceiling
        max_safe_emi = min(net_cash_flow * 0.35, avg_monthly_revenue * 0.20)
        # Scale with trust score factor (0.5 to 1.0)
        trust_factor = max(0.5, min(1.0, trust_score / 100.0))
        target_max_emi = max_safe_emi * trust_factor

        if target_max_emi <= 0:
            return 0.0, 0.0

        # Invert EMI formula to find maximum sustainable principal:
        # P = E * ((1 + r)^n - 1) / (r * (1 + r)^n)
        if r == 0:
            max_principal = target_max_emi * n
        else:
            pow_factor = math.pow(1.0 + r, n)
            max_principal = target_max_emi * (pow_factor - 1.0) / (r * pow_factor)

        # Round to nearest ₹5,000
        max_amount = round(max_principal / 5000.0) * 5000.0
        # Min amount is 35% of max, or ₹10,000 minimum
        min_amount = max(10000.0, round((max_amount * 0.35) / 5000.0) * 5000.0)

        if max_amount < min_amount:
            max_amount = min_amount

        return float(min_amount), float(max_amount)

    @classmethod
    def assess_loan(
        cls,
        requested_amount: float,
        tenure_months: int,
        purpose: str,
        trust_score: int,
        net_cash_flow: float,
        avg_monthly_revenue: float,
        expense_ratio: float,
        repayment_capacity: float,
        fraud_alert_rate: float,
    ) -> LoanAssessmentResult:
        """
        Executes full FT-03 loan underwriting assessment.
        Returns explainable prototype recommendation, sustainable bounds,
        and over-borrowing cautions.
        """
        annual_rate, risk_level = cls.determine_rate_and_risk(trust_score, fraud_alert_rate)

        emi_calc = cls.calculate_emi(requested_amount, annual_rate, tenure_months)
        emi = emi_calc.emi

        rec_min, rec_max = cls.calculate_recommended_range(
            trust_score=trust_score,
            net_cash_flow=net_cash_flow,
            avg_monthly_revenue=avg_monthly_revenue,
            tenure_months=tenure_months,
            annual_interest_rate=annual_rate,
        )

        # Post-loan projected monthly surplus
        post_loan_surplus = net_cash_flow - emi

        # Repayment burden percentage: EMI / Net Cash Flow
        if net_cash_flow > 0:
            burden_pct = round((emi / net_cash_flow) * 100.0, 1)
        elif emi > 0:
            burden_pct = 150.0  # Deficit indicator
        else:
            burden_pct = 0.0

        # Over-borrowing risk criteria:
        # 1. Requested amount > recommended max by >15%
        # 2. Burden > 35% of net monthly cash flow
        # 3. Post-loan cash flow goes into negative deficit
        is_overborrowing = (
            (rec_max > 0 and requested_amount > rec_max * 1.15)
            or (burden_pct > 35.0)
            or (post_loan_surplus < 0)
        )

        # ── Explainability: Supporting Factors ────────────────────────────────
        supporting: list[str] = []
        if trust_score >= 65:
            supporting.append(
                f"Strong Financial Trust Score of {trust_score}/100 based on verified commercial behavior"
            )
        elif trust_score >= 50:
            supporting.append(
                f"Moderate Financial Trust Score of {trust_score}/100 demonstrating viable business activity"
            )

        if net_cash_flow > 0:
            supporting.append(
                f"Positive operating cash flow averaging +₹{net_cash_flow:,.0f}/month"
            )

        if post_loan_surplus > 0:
            supporting.append(
                f"Projected post-loan surplus remains positive at +₹{post_loan_surplus:,.0f}/month after servicing EMI"
            )

        if fraud_alert_rate == 0.0:
            supporting.append("Zero risk or fraud anomaly signals across analyzed transactions")

        if repayment_capacity >= 0.20:
            supporting.append(
                f"Resilient debt service buffer ({repayment_capacity:.1%} net surplus margin)"
            )

        # ── Explainability: Caution Factors ──────────────────────────────────
        cautions: list[str] = []
        if requested_amount > rec_max and rec_max > 0:
            excess = requested_amount - rec_max
            cautions.append(
                f"Requested amount of ₹{requested_amount:,.0f} exceeds sustainable ceiling of ₹{rec_max:,.0f} by ₹{excess:,.0f}"
            )

        if post_loan_surplus < 0:
            cautions.append(
                f"Operating Deficit Alert: Post-loan surplus turns negative (-₹{abs(post_loan_surplus):,.0f}/month) with this EMI"
            )

        if burden_pct > 35.0:
            cautions.append(
                f"High Repayment Burden: Monthly EMI represents {burden_pct:.1f}% of net cash flow (prudent benchmark is ≤35%)"
            )

        if expense_ratio > 0.85:
            cautions.append(
                f"Elevated Expense Ratio: {expense_ratio:.1%} of monthly revenue is consumed by operational costs"
            )

        if fraud_alert_rate > 0:
            cautions.append(
                f"Risk Telemetry: {fraud_alert_rate:.1%} of transactions flagged with risk anomalies"
            )

        if net_cash_flow <= 0:
            cautions.append(
                "Current monthly cash flow is zero or negative; repayment capacity is strictly constrained"
            )

        # ── Prototype Recommendation Headline ─────────────────────────────────
        if is_overborrowing:
            proto_rec = (
                f"Prototype Advisory: Consider reducing borrowing to ₹{rec_min:,.0f} - ₹{rec_max:,.0f} "
                f"or extending tenure to reduce monthly repayment burden below 35%."
            )
        elif rec_max == 0:
            proto_rec = (
                "Prototype Advisory: Inflows currently insufficient for commercial micro-lending. "
                "Improve cash flow consistency before applying."
            )
        else:
            proto_rec = (
                f"Prototype Recommendation: Recommended Range ₹{rec_min:,.0f} - ₹{rec_max:,.0f} "
                f"at {annual_rate:.1f}% p.a. over {tenure_months} months."
            )

        return LoanAssessmentResult(
            recommended_min_amount=round(rec_min, 2),
            recommended_max_amount=round(rec_max, 2),
            requested_amount=round(requested_amount, 2),
            tenure_months=tenure_months,
            annual_interest_rate=annual_rate,
            estimated_emi=emi_calc.emi,
            estimated_interest=emi_calc.total_interest,
            total_repayment=emi_calc.total_repayment,
            risk_level=risk_level,
            current_monthly_cash_flow=round(net_cash_flow, 2),
            post_loan_projected_surplus=round(post_loan_surplus, 2),
            repayment_burden_pct=burden_pct,
            is_overborrowing_risk=is_overborrowing,
            prototype_recommendation=proto_rec,
            supporting_factors=supporting,
            caution_factors=cautions,
            detailed_metrics={
                "requested_amount": requested_amount,
                "tenure_months": tenure_months,
                "purpose": purpose,
                "trust_score": trust_score,
                "annual_interest_rate": annual_rate,
                "monthly_interest_rate": emi_calc.monthly_interest_rate,
                "net_cash_flow": net_cash_flow,
                "avg_monthly_revenue": avg_monthly_revenue,
                "expense_ratio": expense_ratio,
                "repayment_capacity": repayment_capacity,
                "fraud_alert_rate": fraud_alert_rate,
            },
        )

    @classmethod
    def simulate(
        cls,
        loan_amount: float,
        tenure_months: int,
        annual_interest_rate: float | None = None,
        trust_score: int = 70,
        net_cash_flow: float = 40000.0,
        fraud_alert_rate: float = 0.0,
    ) -> LoanSimulationResult:
        """
        Dynamically simulates loan parameters for UI sliders and scenario testing.
        """
        rate = (
            annual_interest_rate
            if annual_interest_rate is not None
            else cls.determine_rate_and_risk(trust_score, fraud_alert_rate)[0]
        )
        _, risk_level = cls.determine_rate_and_risk(trust_score, fraud_alert_rate)

        emi_calc = cls.calculate_emi(loan_amount, rate, tenure_months)
        post_surplus = net_cash_flow - emi_calc.emi

        burden_pct = (
            round((emi_calc.emi / net_cash_flow) * 100.0, 1)
            if net_cash_flow > 0
            else (150.0 if emi_calc.emi > 0 else 0.0)
        )

        cautions: list[str] = []
        is_overborrowing = False

        if post_surplus < 0:
            is_overborrowing = True
            cautions.append(
                f"Cash flow turns negative: -₹{abs(post_surplus):,.0f}/month after EMI."
            )
        elif burden_pct > 35.0:
            is_overborrowing = True
            cautions.append(
                f"High repayment burden ({burden_pct:.1f}% of net cash flow)."
            )

        return LoanSimulationResult(
            loan_amount=round(loan_amount, 2),
            tenure_months=tenure_months,
            annual_interest_rate=round(rate, 2),
            emi=emi_calc.emi,
            total_interest=emi_calc.total_interest,
            total_repayment=emi_calc.total_repayment,
            current_cash_flow=round(net_cash_flow, 2),
            post_loan_cash_flow=round(post_surplus, 2),
            repayment_burden_pct=burden_pct,
            is_overborrowing_risk=is_overborrowing,
            risk_level=risk_level,
            cautions=cautions,
        )
