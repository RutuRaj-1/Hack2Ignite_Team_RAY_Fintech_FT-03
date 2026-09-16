"""
FINBRIDGE — Credit Scoring Engine (Part 05)
FT-03: Alternative Credit Assessment Engine

Calculates the FINBRIDGE FINANCIAL TRUST SCORE (0-100) and explainable sub-scores:
- Financial Stability:       25%
- Cash Flow Health:          20%
- Revenue Consistency:       15%
- Expense Discipline:        10%
- Repayment Capacity:        15%
- Transaction Behaviour:     10%
- Fraud/Risk Signals:         5%
Total:                      100%

HACKATHON PROTOTYPE NOTICE:
This is an experimental alternative financial-behavior score for MSMEs.
It is NOT a regulated credit bureau score (e.g. CIBIL/Experian), nor a guaranteed approval.
"""

from dataclasses import dataclass, field
import math
from typing import Any

from app.ml.feature_engineering import BusinessCreditFeatures


# Exact prompt-mandated scoring weights (must sum to 1.0)
SCORE_WEIGHTS = {
    "financial_stability": 0.25,
    "cash_flow_health": 0.20,
    "revenue_consistency": 0.15,
    "expense_discipline": 0.10,
    "repayment_capacity": 0.15,
    "transaction_behavior": 0.10,
    "fraud_risk": 0.05,
}


@dataclass
class ScoreFactor:
    """Explainable factor backed by an actual calculated metric."""
    name: str
    description: str
    metric_name: str
    metric_value: str
    impact: str  # "positive" | "negative"


@dataclass
class CreditScoreResult:
    """Full credit assessment result with trust score, components, and explainability."""
    trust_score: int
    components: dict[str, int]
    positive_factors: list[str]
    negative_factors: list[str]
    detailed_factors: list[ScoreFactor] = field(default_factory=list)
    features: dict[str, Any] = field(default_factory=dict)


class CreditScoringEngine:
    """
    Deterministic scoring engine calculating the Financial Trust Score.
    """

    def calculate_sub_scores(self, f: BusinessCreditFeatures) -> dict[str, int]:
        """
        Calculates 7 individual sub-scores (0-100) from engineered features.
        """
        # ── 1. Financial Stability (25% weight) ──────────────────────────────
        # Evaluates operating longevity, track record depth, and baseline stability
        stab_score = 0
        # Age contribution (up to 35 pts)
        if f.business_age_years >= 5:
            stab_score += 35
        elif f.business_age_years >= 3:
            stab_score += 28
        elif f.business_age_years >= 1:
            stab_score += 20
        elif f.business_age_years > 0:
            stab_score += 12
        else:
            stab_score += 5

        # Active history depth (up to 35 pts)
        if f.active_months >= 6:
            stab_score += 35
        elif f.active_months >= 3:
            stab_score += 25
        elif f.active_months >= 1 and f.total_transactions > 0:
            stab_score += 15
        else:
            stab_score += 0

        # Revenue existence & baseline (up to 30 pts)
        if f.avg_monthly_revenue >= 100_000:
            stab_score += 30
        elif f.avg_monthly_revenue >= 30_000:
            stab_score += 24
        elif f.avg_monthly_revenue > 0:
            stab_score += 16
        else:
            stab_score += 0

        financial_stability = max(0, min(100, stab_score))

        # ── 2. Cash Flow Health (20% weight) ─────────────────────────────────
        # Evaluates net cash flow positivity, monthly reliability, and volatility
        if f.avg_monthly_revenue == 0 and f.avg_monthly_expense == 0:
            cash_flow_health = 0
        elif f.net_cash_flow < 0:
            # Deficit penalty proportional to deficit depth
            deficit_ratio = abs(f.net_cash_flow) / max(f.avg_monthly_revenue, 1.0)
            base_deficit = max(0, int(35 - min(35, deficit_ratio * 25)))
            cash_flow_health = base_deficit
        else:
            # Positive cash flow: base 50 + volume bonus + reliability bonus
            cf_base = 50
            # Net margin volume bonus (up to 25 pts)
            volume_bonus = min(25, int((f.net_cash_flow / 50_000) * 15))
            # Positive months ratio bonus (up to 25 pts)
            reliability_bonus = int(f.positive_cash_flow_months_ratio * 25)
            # Volatility penalty (if volatility exceeds net cash flow by 2x)
            vol_penalty = 0
            if f.net_cash_flow > 0 and f.cash_flow_volatility > (f.net_cash_flow * 1.5):
                vol_penalty = min(15, int((f.cash_flow_volatility / f.net_cash_flow) * 5))
            cash_flow_health = max(0, min(100, cf_base + volume_bonus + reliability_bonus - vol_penalty))

        # ── 3. Revenue Consistency (15% weight) ──────────────────────────────
        # Based on normalized coefficient of variation (revenue_consistency: 1.0 = zero variance)
        if f.avg_monthly_revenue == 0:
            revenue_consistency = 0
        elif f.active_months == 1:
            revenue_consistency = 70  # Baseline single-month consistency
        else:
            # Scale 0.0 - 1.0 consistency into 0 - 100 score
            rev_c = int(f.revenue_consistency * 100)
            revenue_consistency = max(0, min(100, rev_c))

        # ── 4. Expense Discipline (10% weight) ───────────────────────────────
        # Healthy operating expense ratio for MSME is between 40% and 75%
        if f.avg_monthly_revenue == 0:
            expense_discipline = 0 if f.avg_monthly_expense > 0 else 10
        elif f.expense_ratio <= 0.65:
            # Excellent discipline: saving >35% of inflows
            expense_discipline = 95
        elif f.expense_ratio <= 0.80:
            # Good discipline: 80 - 94
            expense_discipline = int(94 - ((f.expense_ratio - 0.65) / 0.15) * 14)
        elif f.expense_ratio <= 0.95:
            # Moderate discipline: 60 - 79
            expense_discipline = int(79 - ((f.expense_ratio - 0.80) / 0.15) * 19)
        elif f.expense_ratio <= 1.05:
            # Break-even to slight deficit: 30 - 59
            expense_discipline = int(59 - ((f.expense_ratio - 0.95) / 0.10) * 29)
        else:
            # Heavy overspending: < 30
            expense_discipline = max(0, int(25 - min(25, (f.expense_ratio - 1.05) * 20)))

        expense_discipline = max(0, min(100, expense_discipline))

        # ── 5. Repayment Capacity (15% weight) ───────────────────────────────
        # Evaluates debt capacity buffer: net margin available after operating costs
        if f.avg_monthly_revenue == 0:
            repayment_capacity = 0
        elif f.repayment_capacity >= 0.30:
            # Net margin >= 30%: very high capacity
            repayment_capacity = min(100, 85 + int((f.repayment_capacity - 0.30) * 50))
        elif f.repayment_capacity >= 0.15:
            # Net margin 15% - 30%: good capacity
            repayment_capacity = int(70 + ((f.repayment_capacity - 0.15) / 0.15) * 15)
        elif f.repayment_capacity >= 0.05:
            # Net margin 5% - 15%: moderate capacity
            repayment_capacity = int(50 + ((f.repayment_capacity - 0.05) / 0.10) * 20)
        elif f.repayment_capacity >= 0.0:
            # Net margin 0% - 5%: thin cushion
            repayment_capacity = int(35 + (f.repayment_capacity / 0.05) * 15)
        else:
            # Negative margin: limited or no capacity
            deficit_depth = abs(f.repayment_capacity)
            repayment_capacity = max(0, int(30 - min(30, deficit_depth * 60)))

        repayment_capacity = max(0, min(100, repayment_capacity))

        # ── 6. Transaction Behaviour (10% weight) ────────────────────────────
        # Evaluates frequency, bilateral balance (inflow & outflow), and commerce density
        if f.total_transactions == 0:
            transaction_behavior = 0
        else:
            tx_score = 0
            # Frequency points (up to 45 pts)
            if f.transaction_frequency >= 20:
                tx_score += 45
            elif f.transaction_frequency >= 10:
                tx_score += 38
            elif f.transaction_frequency >= 5:
                tx_score += 28
            else:
                tx_score += 15

            # Bilateral mix: healthy business has both sales collections and supplier payments (up to 35 pts)
            if f.total_credits > 0 and f.total_debits > 0:
                tx_score += 35
            elif f.total_credits > 0 or f.total_debits > 0:
                tx_score += 18

            # Average ticket size realism (up to 20 pts)
            if f.avg_transaction_value >= 500:
                tx_score += 20
            elif f.avg_transaction_value > 0:
                tx_score += 12

            transaction_behavior = max(0, min(100, tx_score))

        # ── 7. Fraud / Risk Signals (5% weight) ──────────────────────────────
        # Inverted risk metric: 0 fraud alerts = high trust score; high alerts penalize
        if f.total_transactions == 0:
            fraud_risk = 50  # Neutral when no transactions
        elif f.fraud_alert_rate == 0.0:
            fraud_risk = 98  # Pristine risk profile
        elif f.fraud_alert_rate <= 0.05:
            fraud_risk = 82
        elif f.fraud_alert_rate <= 0.15:
            fraud_risk = 60
        elif f.fraud_alert_rate <= 0.30:
            fraud_risk = 35
        else:
            fraud_risk = max(5, int(25 - (f.fraud_alert_rate - 0.30) * 30))

        fraud_risk = max(0, min(100, fraud_risk))

        return {
            "financial_stability": financial_stability,
            "cash_flow_health": cash_flow_health,
            "revenue_consistency": revenue_consistency,
            "expense_discipline": expense_discipline,
            "repayment_capacity": repayment_capacity,
            "transaction_behavior": transaction_behavior,
            "fraud_risk": fraud_risk,
        }

    def calculate_trust_score(self, components: dict[str, int]) -> int:
        """
        Computes weighted total Financial Trust Score (0-100).
        """
        weighted_sum = sum(
            components[key] * SCORE_WEIGHTS[key]
            for key in SCORE_WEIGHTS
        )
        return max(0, min(100, int(round(weighted_sum))))

    def generate_explainability(
        self, f: BusinessCreditFeatures, components: dict[str, int]
    ) -> tuple[list[str], list[str], list[ScoreFactor]]:
        """
        Generates deterministic, metric-backed positive and negative factors.
        Every factor explicitly cites a calculated financial metric.
        """
        positive: list[str] = []
        negative: list[str] = []
        detailed: list[ScoreFactor] = []

        # ── Positive Factors ──
        if f.net_cash_flow > 0:
            msg = f"Positive Net Cash Flow averaging +₹{f.net_cash_flow:,.0f}/month across {f.active_months} active month(s)"
            positive.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Positive Net Cash Flow",
                    description=msg,
                    metric_name="net_cash_flow",
                    metric_value=f"+₹{f.net_cash_flow:,.2f}",
                    impact="positive",
                )
            )

        if f.revenue_consistency >= 0.65 and f.avg_monthly_revenue > 0:
            msg = f"Stable Revenue Inflows (Consistency index: {f.revenue_consistency:.0%}, std dev: ₹{f.revenue_std:,.0f})"
            positive.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Consistent Revenue",
                    description=msg,
                    metric_name="revenue_consistency",
                    metric_value=f"{f.revenue_consistency:.1%}",
                    impact="positive",
                )
            )

        if f.expense_ratio <= 0.80 and f.avg_monthly_revenue > 0:
            msg = f"Disciplined Operating Overhead ({f.expense_ratio:.1%} of monthly revenue spent on operational expenses)"
            positive.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Controlled Operating Expenses",
                    description=msg,
                    metric_name="expense_ratio",
                    metric_value=f"{f.expense_ratio:.1%}",
                    impact="positive",
                )
            )

        if f.repayment_capacity >= 0.15:
            msg = f"Healthy Repayment Buffer ({f.repayment_capacity:.1%} net surplus margin available for debt servicing)"
            positive.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Solid Repayment Capacity",
                    description=msg,
                    metric_name="repayment_capacity",
                    metric_value=f"{f.repayment_capacity:.1%}",
                    impact="positive",
                )
            )

        if f.fraud_alert_rate == 0.0 and f.total_transactions > 0:
            msg = f"Pristine Risk Telemetry (0 anomaly flags across {f.total_transactions} analyzed transactions)"
            positive.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Low Fraud Risk",
                    description=msg,
                    metric_name="fraud_alert_rate",
                    metric_value="0.0%",
                    impact="positive",
                )
            )

        if f.business_age_years >= 2.0:
            msg = f"Established Operational Track Record ({f.business_age_years:.1f} years in active business)"
            positive.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Business Longevity",
                    description=msg,
                    metric_name="business_age_years",
                    metric_value=f"{f.business_age_years:.1f} yrs",
                    impact="positive",
                )
            )

        if f.transaction_frequency >= 10.0:
            msg = f"Active Digital Transaction Velocity ({f.transaction_frequency:.1f} transactions/month)"
            positive.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Active Commerce Circulation",
                    description=msg,
                    metric_name="transaction_frequency",
                    metric_value=f"{f.transaction_frequency:.1f} tx/mo",
                    impact="positive",
                )
            )

        # ── Negative Factors ──
        if f.net_cash_flow < 0:
            msg = f"Operating Cash Flow Deficit (-₹{abs(f.net_cash_flow):,.0f}/month net outflow)"
            negative.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Negative Net Cash Flow",
                    description=msg,
                    metric_name="net_cash_flow",
                    metric_value=f"-₹{abs(f.net_cash_flow):,.2f}",
                    impact="negative",
                )
            )

        if f.expense_ratio > 0.85 and f.avg_monthly_revenue > 0:
            msg = f"High Expense Burden ({f.expense_ratio:.1%} of monthly turnover consumed by operational outflows)"
            negative.append(msg)
            detailed.append(
                ScoreFactor(
                    name="High Expense Ratio",
                    description=msg,
                    metric_name="expense_ratio",
                    metric_value=f"{f.expense_ratio:.1%}",
                    impact="negative",
                )
            )

        if f.revenue_consistency < 0.50 and f.avg_monthly_revenue > 0 and f.active_months > 1:
            msg = f"Revenue Volatility Detected (Standard deviation of ₹{f.revenue_std:,.0f} across active periods)"
            negative.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Revenue Volatility",
                    description=msg,
                    metric_name="revenue_std",
                    metric_value=f"₹{f.revenue_std:,.2f}",
                    impact="negative",
                )
            )

        if f.fraud_alert_rate > 0.0:
            msg = f"Anomaly / Fraud Signals Detected ({f.fraud_alert_rate:.1%} of transactions flagged by risk engine)"
            negative.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Elevated Fraud Alert Rate",
                    description=msg,
                    metric_name="fraud_alert_rate",
                    metric_value=f"{f.fraud_alert_rate:.1%}",
                    impact="negative",
                )
            )

        if f.repayment_capacity < 0.10 and f.avg_monthly_revenue > 0:
            msg = f"Constrained Surplus Cushion ({f.repayment_capacity:.1%} net surplus leaves narrow repayment room)"
            negative.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Low Repayment Capacity",
                    description=msg,
                    metric_name="repayment_capacity",
                    metric_value=f"{f.repayment_capacity:.1%}",
                    impact="negative",
                )
            )

        if f.active_months < 2 and f.total_transactions > 0:
            msg = f"Limited History Depth (Only {f.active_months} active month(s) of transaction data recorded)"
            negative.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Limited Transaction History",
                    description=msg,
                    metric_name="active_months",
                    metric_value=f"{f.active_months} mo",
                    impact="negative",
                )
            )

        if f.total_transactions == 0:
            msg = "No Banking Transactions recorded in ledger"
            negative.append(msg)
            detailed.append(
                ScoreFactor(
                    name="Zero Transaction Data",
                    description=msg,
                    metric_name="total_transactions",
                    metric_value="0",
                    impact="negative",
                )
            )

        return positive, negative, detailed

    def score(
        self,
        features: BusinessCreditFeatures,
    ) -> CreditScoreResult:
        """
        Runs the full assessment pipeline deterministically.
        """
        components = self.calculate_sub_scores(features)
        trust_score = self.calculate_trust_score(components)
        positive_factors, negative_factors, detailed_factors = self.generate_explainability(
            features, components
        )

        features_dict = {
            "avg_monthly_revenue": features.avg_monthly_revenue,
            "avg_monthly_expense": features.avg_monthly_expense,
            "net_cash_flow": features.net_cash_flow,
            "expense_ratio": features.expense_ratio,
            "revenue_std": features.revenue_std,
            "cash_flow_volatility": features.cash_flow_volatility,
            "transaction_frequency": features.transaction_frequency,
            "avg_transaction_value": features.avg_transaction_value,
            "revenue_consistency": features.revenue_consistency,
            "fraud_alert_rate": features.fraud_alert_rate,
            "repayment_capacity": features.repayment_capacity,
            "positive_cash_flow_months_ratio": features.positive_cash_flow_months_ratio,
            "active_months": features.active_months,
            "total_transactions": features.total_transactions,
            "total_credits": features.total_credits,
            "total_debits": features.total_debits,
            "business_age_years": features.business_age_years,
            "annual_turnover": features.annual_turnover,
        }

        return CreditScoreResult(
            trust_score=trust_score,
            components=components,
            positive_factors=positive_factors,
            negative_factors=negative_factors,
            detailed_factors=detailed_factors,
            features=features_dict,
        )
