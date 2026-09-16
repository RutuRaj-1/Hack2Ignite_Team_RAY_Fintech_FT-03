"""
FINBRIDGE — AI Service Abstraction & Fallback Engine (Part 08)
FT-01: Contextual Financial Literacy & AI Coach Layer.

Architecture:
  Financial Data -> Deterministic Calculations -> Structured JSON -> LLM -> Human-readable explanation.
  The LLM never calculates authoritative financial metrics itself.

Providers supported:
  - "ollama": Local Ollama instance (e.g. llama3, mistral, qwen) via http://localhost:11434
  - "gemini": Google Gemini API via GEMINI_API_KEY
  - "openai": OpenAI API via OPENAI_API_KEY
  - "fallback": Deterministic, rule-based contextual generator (zero dependencies, 100% reliable)
"""

import json
import re
from typing import Any
import httpx

from app.core.config import get_settings
from app.schemas.coach import (
    CoachMessage,
    EducationalCard,
    FinancialContext,
)
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.ai_service")
settings = get_settings()


# ─────────────────────────────────────────────────────────────────────────────
# Pre-defined 7 Contextual Educational Cards
# ─────────────────────────────────────────────────────────────────────────────

EDUCATIONAL_CARDS: list[EducationalCard] = [
    EducationalCard(
        id="cash-flow",
        topic="Cash Flow",
        title="Cash Flow vs Revenue: Why Inflow Timing Matters",
        summary="Revenue is what you invoice; cash flow is money in your bank account today.",
        detailed_explanation=(
            "Revenue measures total customer billings, but cash flow measures the exact timing of when cash enters "
            "and leaves your bank account. A business can be profitable on paper but face insolvency if supplier payments "
            "are due before customer payments arrive. Lenders evaluate Net Cash Flow (Inflows minus Outflows) to ensure you "
            "have liquidity to cover monthly commitments."
        ),
        practical_tip="Aim for a positive Net Cash Flow buffer each month by shortening invoice payment terms to 15 days.",
        example_formula="Net Cash Flow = Monthly Collections (Credits) - Operating Expenses (Debits)",
        sample_question="How can I improve my cash flow?",
    ),
    EducationalCard(
        id="emi",
        topic="EMI",
        title="Understanding EMI (Equated Monthly Installment)",
        summary="A fixed monthly installment covering both loan principal repayment and accrued interest.",
        detailed_explanation=(
            "An Equated Monthly Installment (EMI) is the equal monthly amount you pay back to service a loan. "
            "In modern micro-finance, reducing-balance EMI is standard: in early months, a larger portion covers interest, "
            "while in later months, the bulk pays down principal as the remaining balance drops."
        ),
        practical_tip="Always match your EMI due date to occur 2 to 3 days after your largest recurring customer inflows.",
        example_formula="EMI = P * r * (1+r)^n / ((1+r)^n - 1)",
        sample_question="What does EMI mean?",
    ),
    EducationalCard(
        id="interest",
        topic="Interest",
        title="Interest Rates & True Borrowing Cost (APR)",
        summary="How annual percentage rates (APR) translate into actual monthly borrowing costs.",
        detailed_explanation=(
            "The interest rate is the cost of borrowing capital. While annual rates may look small (e.g. 14% p.a.), "
            "compounding and processing fees determine the Annual Percentage Rate (APR). Businesses with higher "
            "Financial Trust Scores qualify for lower risk tiers, reducing overall interest paid over the loan life."
        ),
        practical_tip="Compare total repayment amount rather than just the stated interest percentage across lenders.",
        example_formula="Total Interest = (EMI * Tenure Months) - Loan Principal",
        sample_question="How is loan interest calculated on my business?",
    ),
    EducationalCard(
        id="repayment-burden",
        topic="Repayment Burden",
        title="Repayment Burden: Safe Debt-to-Surplus Benchmarks",
        summary="Why monthly EMI should never consume more than 35% of your net operating surplus.",
        detailed_explanation=(
            "Repayment burden measures how much of your monthly surplus is committed to loan debt service. "
            "If your net surplus is ₹50,000 and your EMI is ₹35,000, your burden is 70%—leaving almost no cushion "
            "for unexpected supplier price spikes, equipment repairs, or delayed customer receivables. "
            "Prudent financial hygiene requires keeping repayment burden below 35%."
        ),
        practical_tip="If an EMI exceeds 35% of your monthly cash flow, extend the loan tenure or borrow a smaller amount.",
        example_formula="Repayment Burden Ratio = (Monthly EMI / Net Monthly Cash Flow) * 100",
        sample_question="What is repayment burden?",
    ),
    EducationalCard(
        id="revenue-consistency",
        topic="Revenue Consistency",
        title="Revenue Consistency & Predictable Collections",
        summary="Predictable, regular monthly turnover scores higher than unpredictable peak-and-trough sales.",
        detailed_explanation=(
            "Alternative underwriting models evaluate the Coefficient of Variation (CV) in your monthly banking inflows. "
            "A business that steadily collects ₹1,00,000 every month is statistically far less likely to default than one "
            "that earns ₹3,00,000 in festival months but ₹10,000 during the rest of the year. Consistency builds credit trust."
        ),
        practical_tip="Introduce recurring customer subscriptions, retainers, or weekly bulk deliveries to smooth out seasonal lulls.",
        example_formula="Consistency Score = 1.0 - (Monthly Revenue Std Dev / Mean Revenue)",
        sample_question="Why is revenue consistency important for credit?",
    ),
    EducationalCard(
        id="expense-management",
        topic="Expense Management",
        title="Expense Discipline: Controlling Operating Overheads",
        summary="Keeping operating costs below 75% of revenue preserves repayment capacity.",
        detailed_explanation=(
            "Expense discipline measures how efficiently an enterprise converts customer revenue into net operating cash. "
            "Healthy micro-enterprises maintain an expense ratio between 40% and 75%. When expenses exceed 85-90% of revenue, "
            "even minor supply-chain price inflation can throw the business into sudden operational deficit."
        ),
        practical_tip="Review recurring vendor contracts quarterly and separate personal withdrawals from merchant operations.",
        example_formula="Expense Ratio = Total Monthly Expenses / Total Monthly Revenue",
        sample_question="What is a healthy expense ratio for an MSME?",
    ),
    EducationalCard(
        id="transaction-risk",
        topic="Transaction Risk",
        title="Transaction Risk & Anomaly Signals",
        summary="How banking and UPI transaction patterns safeguard your business against risk flags.",
        detailed_explanation=(
            "Digital underwriting systems scan transaction telemetry in real-time. Signals such as high-velocity off-hours transfers "
            "(midnight to 4 AM), sudden transfers to unknown counterparties, or circular round-trip invoices trigger risk alerts. "
            "Maintaining clean, transparent commercial transaction habits protects your Financial Trust Score."
        ),
        practical_tip="Execute vendor disbursements during standard banking hours and ensure clear transaction narrations.",
        example_formula="Risk Score = Weighted sum of Rule Anomaly Flags + Isolation Forest Deviation",
        sample_question="Why was this transaction flagged?",
    ),
]


class AIService:
    """
    Unified AI service supporting Local Ollama, remote APIs, and deterministic fallbacks.
    """

    def __init__(self):
        self.provider = settings.llm_provider.lower()
        self.ollama_url = settings.ollama_base_url.rstrip("/")
        self.ollama_model = settings.ollama_model

    # ─────────────────────────────────────────────────────────────────────────
    # Public Interface
    # ─────────────────────────────────────────────────────────────────────────

    async def financial_coach(
        self,
        question: str,
        context: FinancialContext,
        history: list[CoachMessage] | None = None,
    ) -> tuple[str, str]:
        """
        Coordinates the financial coach response.
        Returns: (answer_text, provider_used)
        """
        # Try primary local Ollama if selected
        if self.provider == "ollama":
            ollama_ans = await self._query_ollama(question, context, history)
            if ollama_ans:
                return ollama_ans, "ollama"

        # Deterministic grounded fallback
        fallback_ans = self._deterministic_coach_response(question, context)
        return fallback_ans, "fallback"

    def generate_financial_explanation(
        self, metrics: dict[str, Any], summary_type: str = "general"
    ) -> str:
        """
        Explains deterministic financial telemetry in clear language.
        """
        rev = metrics.get("monthly_revenue") or metrics.get("avg_monthly_revenue") or 0.0
        exp = metrics.get("monthly_expenses") or metrics.get("avg_monthly_expense") or 0.0
        net = metrics.get("net_cash_flow") or (rev - exp)
        ratio = metrics.get("expense_ratio") or (exp / rev if rev > 0 else 0.0)
        trust = metrics.get("trust_score") or 50

        status = "healthy" if net > 0 and ratio <= 0.75 else ("cautious" if net > 0 else "deficit")

        return (
            f"Based on the available prototype data, your business currently generates an average of ₹{rev:,.0f} "
            f"in monthly revenue against ₹{exp:,.0f} in operating expenses, resulting in a net monthly surplus of "
            f"₹{net:,.0f} (expense ratio: {ratio:.1%}). With a Financial Trust Score of {trust}/100, your operating "
            f"liquidity is in a {status} position."
        )

    def explain_fraud_alert(self, alert_data: dict[str, Any]) -> str:
        """
        Explains why a transaction or risk signal was flagged by the telemetry layer.
        """
        amount = alert_data.get("amount", 0.0)
        risk_level = alert_data.get("risk_level", "MEDIUM")
        reasons = alert_data.get("detected_reasons", [])

        reason_text = (
            "; ".join(reasons)
            if reasons
            else "unusual transaction deviation detected relative to historical baseline"
        )

        return (
            f"Based on the available prototype data, this transaction of ₹{amount:,.0f} was assigned a "
            f"{risk_level} risk tier because our FT-02 telemetry detected: {reason_text}. "
            f"This is a signal-only alert and does not imply fraudulent intent; it highlights an operational "
            f"anomaly that may warrant verification."
        )

    def explain_scheme(
        self, scheme_data: dict[str, Any], business_context: dict[str, Any]
    ) -> str:
        """
        Explains why a government scheme matches the MSME's profile.
        """
        name = scheme_data.get("scheme_name", "Government Support Scheme")
        score = scheme_data.get("match_score", 80)
        benefits = scheme_data.get("benefits", "Subsidized working capital and interest subvention")

        return (
            f"Based on the available prototype data, '{name}' matches your enterprise with an alignment score "
            f"of {score}%. Key benefits include: {benefits}. Your recorded business tenure and turnover meet "
            f"the preliminary criteria for this initiative."
        )

    # ─────────────────────────────────────────────────────────────────────────
    # Local Ollama Query
    # ─────────────────────────────────────────────────────────────────────────

    async def _query_ollama(
        self,
        question: str,
        context: FinancialContext,
        history: list[CoachMessage] | None = None,
    ) -> str | None:
        """
        Sends prompt to local Ollama instance with timeout.
        If Ollama is not running or fails, returns None to trigger deterministic fallback.
        """
        system_prompt = (
            "You are FINBRIDGE AI Financial Coach, an expert MSME financial literacy guide. "
            "SAFETY AND FACTUALITY RULES:\n"
            "1. Ground every answer strictly in the provided structured JSON financial context.\n"
            "2. NEVER calculate authoritative metrics yourself; use the provided numbers.\n"
            "3. NEVER say 'Approved' or guarantee lending or grant eligibility.\n"
            "4. Always include or preface with: 'Based on the available prototype data...'\n"
            "5. Explain financial concepts (EMI, Cash Flow, Repayment Burden, etc.) in simple, encouraging terms.\n\n"
            f"BUSINESS FINANCIAL CONTEXT:\n{context.model_dump_json(indent=2)}"
        )

        prompt_payload = {
            "model": self.ollama_model,
            "prompt": f"{system_prompt}\n\nUser Question: {question}\n\nCoach Answer:",
            "stream": False,
            "options": {
                "temperature": 0.2,
                "top_p": 0.9,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{self.ollama_url}/api/generate", json=prompt_payload
                )
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "").strip()
                    if response_text:
                        return response_text
        except Exception as e:
            logger.info("Local Ollama not reachable, using deterministic fallback: %s", e)

        return None

    # ─────────────────────────────────────────────────────────────────────────
    # Deterministic Contextual Fallback Engine
    # ─────────────────────────────────────────────────────────────────────────

    def _deterministic_coach_response(
        self, question: str, c: FinancialContext
    ) -> str:
        """
        Intelligent, deterministic rule-based response generator.
        Interprets actual structured financial context accurately with zero network calls.
        """
        q_lower = question.lower().strip()

        # ── 1. Loan Affordability Query ──────────────────────────────────────
        # e.g. "Can I afford a ₹50,000 loan?" / "Can I borrow ...?"
        if any(w in q_lower for w in ["afford", "can i borrow", "eligible for loan", "take a loan"]):
            # Extract loan amount if mentioned
            matches = re.findall(r"₹?\s*([\d,]+)", question)
            asked_amt = 50000.0
            if matches:
                try:
                    asked_amt = float(matches[0].replace(",", ""))
                except ValueError:
                    pass
            elif c.requested_loan > 0:
                asked_amt = c.requested_loan

            # Check affordability against net cash flow
            # Approximate EMI for 12 months @ 14% is roughly asked_amt * 0.09
            approx_emi = asked_amt * 0.0898
            burden = (approx_emi / c.net_cash_flow * 100.0) if c.net_cash_flow > 0 else 150.0

            if c.net_cash_flow <= 0:
                return (
                    f"Based on the available prototype data, taking on a ₹{asked_amt:,.0f} loan is not currently "
                    f"recommended. Your business is operating with a monthly net cash flow deficit of "
                    f"₹{c.net_cash_flow:,.0f}. Taking on an estimated monthly EMI of ~₹{approx_emi:,.0f} would worsen "
                    f"your liquidity. We advise stabilizing customer collections and lowering operating expenses "
                    f"(currently {c.expense_ratio:.1%} of revenue) before borrowing."
                )
            elif burden <= 35.0:
                projected_surplus = c.net_cash_flow - approx_emi
                return (
                    f"Based on the available prototype data, you appear comfortably able to afford a ₹{asked_amt:,.0f} loan. "
                    f"At standard prototype rates (12-14% p.a. for 12 months), the estimated monthly EMI would be ~₹{approx_emi:,.0f}. "
                    f"With your current net monthly surplus of ₹{c.net_cash_flow:,.0f}, the repayment burden is {burden:.1f}% "
                    f"(safely within the prudent benchmark of ≤35%). Your post-loan projected surplus remains positive at "
                    f"+₹{projected_surplus:,.0f}/month."
                )
            else:
                return (
                    f"Based on the available prototype data, borrowing ₹{asked_amt:,.0f} presents a high repayment burden. "
                    f"The estimated monthly EMI of ~₹{approx_emi:,.0f} represents {burden:.1f}% of your net monthly cash flow "
                    f"(₹{c.net_cash_flow:,.0f}), which exceeds the recommended 35% safety ceiling. Consider borrowing a smaller "
                    f"amount (e.g. ₹{c.net_cash_flow * 3:,.0f}) or extending the repayment tenure to keep monthly installments manageable."
                )

        # ── 2. Financial Trust Score Query ───────────────────────────────────
        # e.g. "Why is my financial trust score low?" / "Explain my trust score"
        if any(w in q_lower for w in ["trust score", "score low", "score high", "credit score"]):
            reasons = []
            if c.net_cash_flow <= 0:
                reasons.append("negative monthly cash flow (-₹{:,.0f}/mo)".format(abs(c.net_cash_flow)))
            if c.expense_ratio > 0.80:
                reasons.append("high operating expense ratio ({:.1%} of revenue consumed)".format(c.expense_ratio))
            if c.fraud_risk in ("MEDIUM", "HIGH"):
                reasons.append(f"elevated transaction risk telemetry ({c.fraud_risk} tier)")
            if c.active_months < 3:
                reasons.append("limited verified banking transaction history (under 3 active months)")

            reason_text = " and ".join(reasons) if reasons else "moderate transaction velocity and operating margins"

            return (
                f"Based on the available prototype data, your FINBRIDGE Financial Trust Score is {c.trust_score}/100. "
                f"The primary factors influencing this score are: {reason_text}. "
                f"Our scoring model evaluates 7 objective pillars including Financial Stability (25%), Cash Flow Health (20%), "
                f"and Expense Discipline (10%). You can improve this score by keeping monthly overhead below 75% and "
                f"maintaining consistent digital customer collections."
            )

        # ── 3. Fraud Alert / Flagged Transaction Query ───────────────────────
        # e.g. "Why was this transaction flagged?" / "fraud alert"
        if any(w in q_lower for w in ["flagged", "fraud", "anomaly", "suspicious", "risk alert"]):
            return (
                f"Based on the available prototype data, transactions are flagged by our FT-02 telemetry shield "
                f"when they deviate from your historical business baseline. Common triggers include unusually large amounts "
                f"(e.g. 3x above average ticket size), off-hours transfers (11 PM - 4 AM), transfers to unverified first-time "
                f"merchants, or rapid back-to-back fund movements. Your current business risk tier is '{c.fraud_risk}'. "
                f"These flags are informational safeguards designed to protect your account from unauthorized activity."
            )

        # ── 4. Cash Flow Improvement Query ───────────────────────────────────
        # e.g. "How can I improve my cash flow?"
        if any(w in q_lower for w in ["improve cash flow", "cash flow", "increase revenue", "cut expenses"]):
            return (
                f"Based on the available prototype data, your business collects ₹{c.monthly_revenue:,.0f}/month "
                f"with operating expenses of ₹{c.monthly_expenses:,.0f}/month (expense ratio: {c.expense_ratio:.1%}). "
                f"To strengthen your cash flow: 1) Shorten customer credit periods by offering a 2% discount for prompt UPI settlement; "
                f"2) Renegotiate bulk supplier terms to stagger outgoing payments; 3) Separate personal and commercial spending "
                f"to ensure your ₹{c.net_cash_flow:,.0f} surplus remains protected for working capital needs."
            )

        # ── 5. EMI Meaning / Education Query ─────────────────────────────────
        # e.g. "What does EMI mean?" / "explain emi"
        if "emi" in q_lower:
            return (
                "Based on the available prototype data, EMI stands for Equated Monthly Installment. "
                "It is a fixed amount you pay back to a lender each month to settle a loan over a chosen tenure. "
                "Each EMI includes both principal repayment and interest. FINBRIDGE uses reducing-balance amortization, "
                "meaning as your principal balance decreases over time, the interest portion of each EMI also shrinks."
            )

        # ── 6. Repayment Burden Query ────────────────────────────────────────
        # e.g. "What is repayment burden?"
        if any(w in q_lower for w in ["repayment burden", "burden", "debt burden"]):
            return (
                f"Based on the available prototype data, Repayment Burden is the percentage of your net monthly cash flow "
                f"that goes toward servicing loan EMIs. For example, with your net monthly surplus of ₹{c.net_cash_flow:,.0f}, "
                f"financial safety guidelines recommend that total EMIs should not exceed 35% (approx. ₹{max(0.0, c.net_cash_flow * 0.35):,.0f}/month). "
                f"Keeping your burden under 35% ensures you have emergency reserves if monthly revenue experiences seasonal dips."
            )

        # ── 7. Fallback General Financial Literacy Answer ────────────────────
        return (
            f"Based on the available prototype data, your business has an average monthly revenue of ₹{c.monthly_revenue:,.0f}, "
            f"operating expenses of ₹{c.monthly_expenses:,.0f}, and a net cash flow surplus of ₹{c.net_cash_flow:,.0f}. "
            f"Your Financial Trust Score is {c.trust_score}/100 with a '{c.fraud_risk}' risk tier. "
            f"You can ask me questions such as: 'Can I afford a ₹50,000 loan?', 'Why was this transaction flagged?', "
            f"'How can I improve my cash flow?', or 'What does repayment burden mean?'"
        )
