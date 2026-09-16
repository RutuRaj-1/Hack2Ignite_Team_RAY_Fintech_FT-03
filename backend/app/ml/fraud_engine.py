"""
FINBRIDGE — Hybrid Fraud / Risk Engine (Part 04)
FT-02: Transaction Risk Intelligence Layer

Architecture
============
  Transactions
      │
      ▼
  ┌───────────────────────────────────────────────────────┐
  │  RuleEngine   (deterministic, always runs)            │
  │    R1. unusually_large_transaction                    │
  │    R2. unusual_transaction_hour                       │
  │    R3. abnormal_transaction_frequency                 │
  │    R4. new_merchant_large_amount                      │
  │    R5. deviation_from_historical_behavior             │
  │    R6. rapid_fund_movement                            │
  └───────────────────────────────────────────────────────┘
      │  rule_score (0-100)
      │
  ┌───────────────────────────────────────────────────────┐
  │  IsolationForestDetector  (when history >= 10 rows)   │
  │    Features: amount, hour, day_of_week,               │
  │              txn_count_7d, avg_amount_30d             │
  └───────────────────────────────────────────────────────┘
      │  if_score (0-100)
      │
  ┌───────────────────────────────────────────────────────┐
  │  Score Combiner                                       │
  │                                                       │
  │  IF available:                                        │
  │    risk_score = round(rule_score * 0.70 +             │
  │                       if_score  * 0.30)              │
  │    model_type = "hybrid"                              │
  │                                                       │
  │  IF skipped (< MIN_HISTORY_FOR_IF):                   │
  │    risk_score = round(rule_score)                     │
  │    model_type = "rule_engine"                         │
  │                                                       │
  │  risk_level:                                          │
  │    HIGH   ≥ 70                                        │
  │    MEDIUM ≥ 40                                        │
  │    LOW    < 40                                        │
  └───────────────────────────────────────────────────────┘

Rule severity weights:
  LOW    = 10 points
  MEDIUM = 25 points
  HIGH   = 40 points

Max possible rule score = sum of all six HIGH weights = 240
rule_score = (sum_triggered_weights / 240) * 100, clamped to 100.

No deep learning. No LLM. Pure scikit-learn + deterministic logic.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional

logger = logging.getLogger("finbridge.ml.fraud_engine")

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

MIN_HISTORY_FOR_IF = 10          # Minimum history rows to run Isolation Forest
LARGE_TXN_MULTIPLIER = 3.0       # > N× historical avg → "unusually large"
LARGE_TXN_ABSOLUTE_INR = 100_000 # Also flag if > ₹1L regardless of history
UNUSUAL_HOUR_START = 23          # 23:00 – 05:00 is "unusual"
UNUSUAL_HOUR_END = 5
FREQUENCY_WINDOW_DAYS = 1        # Transactions within N days
FREQUENCY_THRESHOLD = 5          # More than N transactions in window
NEW_MERCHANT_LARGE_MULTIPLIER = 2.0  # New merchant + > N× avg
HISTORY_DEVIATION_SIGMA = 2.5    # Std-devs from mean to flag
RAPID_FUND_WINDOW_HOURS = 24     # Time window for rapid movement rule

# Severity → weight mapping
SEVERITY_WEIGHTS = {"LOW": 10, "MEDIUM": 25, "HIGH": 40}
MAX_RULE_SCORE = sum(SEVERITY_WEIGHTS["HIGH"] for _ in range(6))  # 240


# ─────────────────────────────────────────────────────────────────────────────
# Data containers
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class TxnContext:
    """
    Minimal transaction context passed to each rule.
    Uses plain Python types so rules are DB-agnostic and trivially testable.
    """
    transaction_id: str
    amount: Decimal
    transaction_type: str           # "credit" | "debit"
    transaction_date: date
    merchant: Optional[str]
    description: Optional[str]
    timestamp: Optional[datetime]   # Precise datetime if available


@dataclass
class HistoryContext:
    """
    Aggregated history for the business, computed once per engine run.
    """
    all_transactions: list[TxnContext] = field(default_factory=list)
    # Pre-computed helpers (populated by FraudEngine.build_history_context)
    known_merchants: set[str] = field(default_factory=set)
    avg_amount: Decimal = Decimal("0")
    std_amount: Decimal = Decimal("0")
    max_amount: Decimal = Decimal("0")
    # Sorted list of all transaction datetimes (for frequency/timing)
    sorted_datetimes: list[datetime] = field(default_factory=list)


@dataclass
class RuleResult:
    rule_name: str
    triggered: bool
    severity: str      # "LOW" | "MEDIUM" | "HIGH"
    reason: str


@dataclass
class RiskAssessment:
    risk_score: int                          # 0–100
    risk_level: str                          # "LOW" | "MEDIUM" | "HIGH"
    rule_score: float
    if_score: float
    model_type: str                          # "rule_engine" | "hybrid"
    triggered_rules: list[RuleResult]


# ─────────────────────────────────────────────────────────────────────────────
# Rule Engine
# ─────────────────────────────────────────────────────────────────────────────

class RuleEngine:
    """
    Six deterministic risk rules. Each returns a RuleResult.
    Rules are stateless — all context is passed in.
    """

    # ── R1: Unusually large transaction ────────────────────────────────────
    def r1_unusually_large(
        self, txn: TxnContext, history: HistoryContext
    ) -> RuleResult:
        """
        Triggers if:
          - amount > LARGE_TXN_MULTIPLIER × historical avg, OR
          - amount > LARGE_TXN_ABSOLUTE_INR (₹1L)
        """
        triggered = False
        reason = "Amount within normal range"
        severity = "LOW"

        if history.avg_amount > 0:
            ratio = float(txn.amount) / float(history.avg_amount)
            if ratio > LARGE_TXN_MULTIPLIER:
                triggered = True
                severity = "HIGH" if ratio > 5.0 else "MEDIUM"
                reason = (
                    f"Amount ₹{txn.amount:,.0f} is {ratio:.1f}× the historical "
                    f"average of ₹{history.avg_amount:,.0f}"
                )

        if not triggered and txn.amount >= LARGE_TXN_ABSOLUTE_INR:
            triggered = True
            severity = "MEDIUM"
            reason = f"Amount ₹{txn.amount:,.0f} exceeds absolute threshold of ₹1,00,000"

        return RuleResult("unusually_large_transaction", triggered, severity, reason)

    # ── R2: Unusual transaction hour ───────────────────────────────────────
    def r2_unusual_hour(
        self, txn: TxnContext, history: HistoryContext
    ) -> RuleResult:
        """
        Triggers if timestamp is in the 23:00–05:00 window.
        Falls back to checking description for 'urgent', 'immediate' keywords
        when no timestamp is present.
        """
        triggered = False
        reason = "Transaction at normal business hour"
        severity = "LOW"

        if txn.timestamp:
            hour = txn.timestamp.hour
            in_unusual_window = (
                hour >= UNUSUAL_HOUR_START or hour <= UNUSUAL_HOUR_END
            )
            if in_unusual_window:
                triggered = True
                severity = "MEDIUM"
                reason = (
                    f"Transaction at {hour:02d}:00 — outside normal "
                    f"business hours (23:00–05:00)"
                )
        else:
            # Heuristic: description contains urgency keywords
            desc = (txn.description or "").lower()
            merchant = (txn.merchant or "").lower()
            urgency_keywords = ["urgent", "immediate", "emergency", "asap", "night"]
            if any(kw in desc or kw in merchant for kw in urgency_keywords):
                triggered = True
                severity = "LOW"
                reason = "Description contains urgency indicator (no timestamp to confirm hour)"

        return RuleResult("unusual_transaction_hour", triggered, severity, reason)

    # ── R3: Abnormal transaction frequency ────────────────────────────────
    def r3_abnormal_frequency(
        self, txn: TxnContext, history: HistoryContext
    ) -> RuleResult:
        """
        Triggers if there are > FREQUENCY_THRESHOLD transactions
        on the same date as this transaction.
        """
        same_day_count = sum(
            1 for h in history.all_transactions
            if h.transaction_date == txn.transaction_date
        )
        # Include the current transaction itself
        total = same_day_count  # current txn is in history if re-analysis

        triggered = total > FREQUENCY_THRESHOLD
        if triggered:
            severity = "HIGH" if total > FREQUENCY_THRESHOLD * 2 else "MEDIUM"
            reason = (
                f"{total} transactions on {txn.transaction_date} "
                f"— exceeds normal daily frequency of {FREQUENCY_THRESHOLD}"
            )
        else:
            severity = "LOW"
            reason = f"{total} transaction(s) on {txn.transaction_date} — normal frequency"

        return RuleResult("abnormal_transaction_frequency", triggered, severity, reason)

    # ── R4: New merchant + large amount ───────────────────────────────────
    def r4_new_merchant_large(
        self, txn: TxnContext, history: HistoryContext
    ) -> RuleResult:
        """
        Triggers if:
          - merchant is not in the known merchant set, AND
          - amount > NEW_MERCHANT_LARGE_MULTIPLIER × historical avg
        """
        merchant = (txn.merchant or "").strip().lower()
        is_new_merchant = (
            merchant != ""
            and merchant not in {m.lower() for m in history.known_merchants}
        )
        large = (
            history.avg_amount > 0
            and txn.amount > history.avg_amount * Decimal(str(NEW_MERCHANT_LARGE_MULTIPLIER))
        )

        triggered = is_new_merchant and large
        if triggered:
            severity = "HIGH"
            reason = (
                f"First transaction with merchant '{txn.merchant}' "
                f"for ₹{txn.amount:,.0f} — {NEW_MERCHANT_LARGE_MULTIPLIER}× above average"
            )
        else:
            severity = "LOW"
            parts = []
            if not is_new_merchant:
                parts.append("known merchant")
            if not large:
                parts.append("amount within range")
            reason = "No new-merchant risk: " + ", ".join(parts) if parts else "No new-merchant risk"

        return RuleResult("new_merchant_large_amount", triggered, severity, reason)

    # ── R5: Deviation from historical behavior ────────────────────────────
    def r5_historical_deviation(
        self, txn: TxnContext, history: HistoryContext
    ) -> RuleResult:
        """
        Triggers if amount is more than HISTORY_DEVIATION_SIGMA standard
        deviations above the historical mean.
        """
        if history.std_amount == 0 or len(history.all_transactions) < 3:
            return RuleResult(
                "deviation_from_historical_behavior",
                False, "LOW", "Insufficient history for deviation analysis"
            )

        z_score = float(
            (txn.amount - history.avg_amount) / history.std_amount
        )
        triggered = z_score > HISTORY_DEVIATION_SIGMA
        if triggered:
            severity = "HIGH" if z_score > HISTORY_DEVIATION_SIGMA * 1.5 else "MEDIUM"
            reason = (
                f"Amount ₹{txn.amount:,.0f} is {z_score:.1f} standard deviations "
                f"above historical average (threshold: {HISTORY_DEVIATION_SIGMA}σ)"
            )
        else:
            severity = "LOW"
            reason = (
                f"Amount within {abs(z_score):.1f}σ of historical mean — normal"
            )

        return RuleResult("deviation_from_historical_behavior", triggered, severity, reason)

    # ── R6: Rapid movement of recently received funds ─────────────────────
    def r6_rapid_fund_movement(
        self, txn: TxnContext, history: HistoryContext
    ) -> RuleResult:
        """
        Triggers for a DEBIT transaction if there was a large CREDIT
        within the past RAPID_FUND_WINDOW_HOURS hours, and the debit
        amount is ≥ 60% of that credit.
        """
        if txn.transaction_type != "debit":
            return RuleResult(
                "rapid_fund_movement",
                False, "LOW", "Rule only applies to debit transactions"
            )

        # Find large credits on the same or previous day
        recent_large_credits = [
            h for h in history.all_transactions
            if h.transaction_type == "credit"
            and (txn.transaction_date - h.transaction_date).days <= 1
            and h.amount >= Decimal("10000")  # Minimum meaningful credit
        ]

        if not recent_large_credits:
            return RuleResult(
                "rapid_fund_movement",
                False, "LOW", "No large recent credits in the movement window"
            )

        # Check if this debit is ≥ 60% of any recent large credit
        for credit in recent_large_credits:
            ratio = float(txn.amount) / float(credit.amount)
            if ratio >= 0.6:
                severity = "HIGH" if ratio >= 0.9 else "MEDIUM"
                return RuleResult(
                    "rapid_fund_movement",
                    True, severity,
                    f"Debit ₹{txn.amount:,.0f} is {ratio:.0%} of credit "
                    f"₹{credit.amount:,.0f} received within {RAPID_FUND_WINDOW_HOURS}h"
                )

        return RuleResult(
            "rapid_fund_movement",
            False, "LOW", "Debit amount is below rapid-movement threshold"
        )

    def run_all(
        self, txn: TxnContext, history: HistoryContext
    ) -> list[RuleResult]:
        return [
            self.r1_unusually_large(txn, history),
            self.r2_unusual_hour(txn, history),
            self.r3_abnormal_frequency(txn, history),
            self.r4_new_merchant_large(txn, history),
            self.r5_historical_deviation(txn, history),
            self.r6_rapid_fund_movement(txn, history),
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Isolation Forest Detector
# ─────────────────────────────────────────────────────────────────────────────

class IsolationForestDetector:
    """
    Trains an Isolation Forest on the business's transaction history
    and scores a new transaction as an anomaly.

    Features (5):
      0. amount_normalized  — float(amount) / max_amount
      1. hour               — txn hour (0-23); 12 if no timestamp
      2. day_of_week        — 0 (Mon) – 6 (Sun)
      3. txn_count_7d       — number of txns in past 7 days
      4. avg_amount_30d     — rolling 30-day average amount (normalized)

    Returns if_score in [0, 100] where higher = more anomalous.
    """

    def __init__(self, contamination: float = 0.1, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self._model = None
        self._max_amount: float = 1.0

    def _build_features(
        self,
        txns: list[TxnContext],
        max_amount: float,
    ) -> "list[list[float]]":
        """Convert a list of TxnContext into a 2D feature matrix."""
        import numpy as np  # local import — not needed at module load

        rows = []
        for i, t in enumerate(txns):
            amount_norm = float(t.amount) / max_amount if max_amount > 0 else 0.0
            hour = t.timestamp.hour if t.timestamp else 12
            dow = t.transaction_date.weekday()

            # Transactions in past 7 days (relative to this transaction)
            txn_date = t.transaction_date
            count_7d = sum(
                1 for h in txns
                if 0 <= (txn_date - h.transaction_date).days <= 7
            )

            # Rolling 30-day average amount (normalized)
            recent = [
                float(h.amount)
                for h in txns
                if 0 <= (txn_date - h.transaction_date).days <= 30
            ]
            avg_30d_norm = (sum(recent) / len(recent) / max_amount) if recent and max_amount > 0 else 0.0

            rows.append([amount_norm, hour, dow, count_7d, avg_30d_norm])

        return rows

    def fit(self, history: list[TxnContext]) -> bool:
        """
        Train the model on historical transactions.
        Returns False if there is insufficient data (< MIN_HISTORY_FOR_IF).
        """
        if len(history) < MIN_HISTORY_FOR_IF:
            return False

        try:
            from sklearn.ensemble import IsolationForest
            import numpy as np

            self._max_amount = max(float(t.amount) for t in history) or 1.0
            X = self._build_features(history, self._max_amount)
            arr = np.array(X, dtype=float)

            self._model = IsolationForest(
                n_estimators=100,
                contamination=self.contamination,
                random_state=self.random_state,
                n_jobs=-1,
            )
            self._model.fit(arr)
            return True

        except Exception as exc:
            logger.warning("IsolationForest fit failed: %s", exc)
            self._model = None
            return False

    def score(self, txn: TxnContext, history: list[TxnContext]) -> float:
        """
        Return anomaly score in [0, 100]. Higher = more anomalous.
        Returns 0.0 if model not fitted.

        Isolation Forest decision_function returns negative scores for anomalies
        (more negative = more anomalous). We convert:
          raw ∈ [-0.5, 0.5] approximately
          if_score = clamp((−raw + 0.5) / 1.0 × 100, 0, 100)
        """
        if self._model is None:
            return 0.0

        try:
            import numpy as np

            X = self._build_features([txn], self._max_amount)
            arr = np.array(X, dtype=float)
            raw = float(self._model.decision_function(arr)[0])
            # Convert: more negative raw → higher anomaly score
            if_score = max(0.0, min(100.0, (-raw + 0.5) * 100.0))
            return if_score

        except Exception as exc:
            logger.warning("IsolationForest score failed: %s", exc)
            return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Score Combiner
# ─────────────────────────────────────────────────────────────────────────────

def _compute_rule_score(triggered_rules: list[RuleResult]) -> float:
    """
    rule_score = (sum of severity weights for triggered rules / MAX_RULE_SCORE) × 100
    Clamped to [0, 100].
    """
    total_weight = sum(
        SEVERITY_WEIGHTS.get(r.severity, 0)
        for r in triggered_rules
        if r.triggered
    )
    return min(100.0, (total_weight / MAX_RULE_SCORE) * 100.0)


def _risk_level(score: int) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def _combine_scores(rule_score: float, if_score: float, use_if: bool) -> tuple[int, str]:
    """
    If IF is available:
        risk_score = round(rule_score × 0.70 + if_score × 0.30)
    Else:
        risk_score = round(rule_score)
    Returns (risk_score, risk_level).
    """
    if use_if:
        combined = rule_score * 0.70 + if_score * 0.30
    else:
        combined = rule_score
    score = round(min(100.0, max(0.0, combined)))
    return score, _risk_level(score)


# ─────────────────────────────────────────────────────────────────────────────
# Main Fraud Engine
# ─────────────────────────────────────────────────────────────────────────────

class FraudEngine:
    """
    Orchestrates the rule engine and Isolation Forest for a single transaction.

    Usage:
        history_txns = [TxnContext(...), ...]
        ctx = FraudEngine.build_history_context(history_txns)
        assessment = FraudEngine.analyze(target_txn, ctx, history_txns)
    """

    def __init__(self):
        self._rule_engine = RuleEngine()
        self._if_detector = IsolationForestDetector()
        self._if_trained = False

    def train(self, history: list[TxnContext]) -> None:
        """Train the Isolation Forest on all historical transactions."""
        self._if_trained = self._if_detector.fit(history)
        if self._if_trained:
            logger.info(
                "IsolationForest trained on %d transactions", len(history)
            )
        else:
            logger.info(
                "IsolationForest skipped (only %d transactions; need %d)",
                len(history), MIN_HISTORY_FOR_IF,
            )

    @staticmethod
    def build_history_context(history: list[TxnContext]) -> HistoryContext:
        """Pre-compute aggregates from transaction history once per engine run."""
        if not history:
            return HistoryContext()

        amounts = [float(t.amount) for t in history]
        avg = sum(amounts) / len(amounts)
        variance = sum((a - avg) ** 2 for a in amounts) / len(amounts)
        std = variance ** 0.5

        known = {
            t.merchant.strip().lower()
            for t in history
            if t.merchant and t.merchant.strip()
        }

        return HistoryContext(
            all_transactions=history,
            known_merchants=known,
            avg_amount=Decimal(str(round(avg, 2))),
            std_amount=Decimal(str(round(std, 2))),
            max_amount=Decimal(str(max(amounts))),
            sorted_datetimes=[
                t.timestamp for t in history if t.timestamp
            ],
        )

    def analyze(
        self,
        txn: TxnContext,
        history_ctx: HistoryContext,
        history: list[TxnContext],
    ) -> RiskAssessment:
        """
        Run the full hybrid engine on one transaction.
        Returns a RiskAssessment with final score, level, and triggered rules.
        """
        # 1. Rules
        all_rules = self._rule_engine.run_all(txn, history_ctx)
        triggered = [r for r in all_rules if r.triggered]
        rule_score = _compute_rule_score(all_rules)

        # 2. Isolation Forest
        if_score = 0.0
        if self._if_trained:
            if_score = self._if_detector.score(txn, history)

        use_if = self._if_trained
        risk_score, risk_level = _combine_scores(rule_score, if_score, use_if)
        model_type = "hybrid" if use_if else "rule_engine"

        return RiskAssessment(
            risk_score=risk_score,
            risk_level=risk_level,
            rule_score=round(rule_score, 2),
            if_score=round(if_score, 2),
            model_type=model_type,
            triggered_rules=triggered,
        )
