"""
FINBRIDGE — Feature Engineering Engine (Part 05)
FT-03: Alternative Credit Assessment Engine

Extracts deterministic financial, cash-flow, operational, and risk features
strictly from objective financial records and business telemetry.

FAIRNESS GUARANTEE:
Strictly adheres to fairness regulations. Never considers religion, caste,
political affiliation, health information, or demographic attributes.
Only uses verifiable cash-flow, expense discipline, transaction behavior,
and risk telemetry.
"""

from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
import math
from typing import Any, Iterable, Sequence


@dataclass(frozen=True)
class BusinessCreditFeatures:
    """
    Structured feature vector extracted for credit assessment.
    Deterministic, reproducible, and explainable.
    """
    avg_monthly_revenue: float
    revenue_std: float
    avg_monthly_expense: float
    expense_ratio: float
    net_cash_flow: float
    cash_flow_volatility: float
    transaction_frequency: float  # transactions per active month (or total if < 1 month)
    avg_transaction_value: float
    revenue_consistency: float    # 1.0 - CV (clamped between 0.0 and 1.0)
    fraud_alert_rate: float       # percentage/fraction of txns flagged Medium/High risk
    repayment_capacity: float     # net margin ratio (net_cash_flow / revenue, or 0 if rev=0)
    positive_cash_flow_months_ratio: float # fraction of months where revenue >= expense
    active_months: int
    total_transactions: int
    total_credits: int
    total_debits: int
    business_age_years: float     # business operating age in years
    annual_turnover: float        # self-reported or verified annual turnover


def _to_float(val: Any) -> float:
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, Decimal):
        return float(val)
    try:
        return float(str(val))
    except (ValueError, TypeError):
        return 0.0


def _parse_date(val: Any) -> date | None:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val[:10]).date()
        except ValueError:
            return None
    return None


def extract_credit_features(
    transactions: Sequence[Any],
    fraud_alerts: Sequence[Any] | None = None,
    business: Any | None = None,
) -> BusinessCreditFeatures:
    """
    Deterministically computes the feature set required for the FINBRIDGE Financial Trust Score.
    Works seamlessly with SQLAlchemy model instances, dataclasses, or plain dicts.
    """
    tx_list = list(transactions) if transactions else []
    alert_list = list(fraud_alerts) if fraud_alerts else []

    # Business profile metadata (strictly non-discriminatory)
    business_age_years = 0.0
    annual_turnover = 0.0
    if business is not None:
        if isinstance(business, dict):
            business_age_years = _to_float(business.get("business_age", 0))
            annual_turnover = _to_float(business.get("annual_turnover", 0))
        else:
            business_age_years = _to_float(getattr(business, "business_age", 0))
            annual_turnover = _to_float(getattr(business, "annual_turnover", 0))

    if not tx_list:
        return BusinessCreditFeatures(
            avg_monthly_revenue=0.0,
            revenue_std=0.0,
            avg_monthly_expense=0.0,
            expense_ratio=0.0,
            net_cash_flow=0.0,
            cash_flow_volatility=0.0,
            transaction_frequency=0.0,
            avg_transaction_value=0.0,
            revenue_consistency=0.0,
            fraud_alert_rate=0.0,
            repayment_capacity=0.0,
            positive_cash_flow_months_ratio=0.0,
            active_months=0,
            total_transactions=0,
            total_credits=0,
            total_debits=0,
            business_age_years=business_age_years,
            annual_turnover=annual_turnover,
        )

    # Aggregate by calendar month
    monthly_rev: dict[str, float] = defaultdict(float)
    monthly_exp: dict[str, float] = defaultdict(float)
    amounts: list[float] = []

    total_credits = 0
    total_debits = 0
    total_revenue = 0.0
    total_expenses = 0.0

    for tx in tx_list:
        if isinstance(tx, dict):
            amt = _to_float(tx.get("amount", 0))
            tx_type = str(tx.get("transaction_type", "")).lower()
            tx_date = _parse_date(tx.get("transaction_date") or tx.get("timestamp"))
        else:
            amt = _to_float(getattr(tx, "amount", 0))
            tx_type = str(getattr(tx, "transaction_type", "")).lower()
            tx_date = _parse_date(getattr(tx, "transaction_date", None) or getattr(tx, "timestamp", None))

        month_key = tx_date.strftime("%Y-%m") if tx_date else "all"
        amounts.append(amt)

        if tx_type == "credit":
            monthly_rev[month_key] += amt
            total_revenue += amt
            total_credits += 1
        elif tx_type == "debit":
            monthly_exp[month_key] += amt
            total_expenses += amt
            total_debits += 1

    all_months = sorted(set(monthly_rev.keys()) | set(monthly_exp.keys()))
    n_months = max(len(all_months), 1)

    avg_monthly_revenue = total_revenue / n_months
    avg_monthly_expense = total_expenses / n_months
    net_cash_flow = avg_monthly_revenue - avg_monthly_expense

    # Expense ratio
    if avg_monthly_revenue > 0:
        expense_ratio = avg_monthly_expense / avg_monthly_revenue
    elif avg_monthly_expense > 0:
        expense_ratio = 2.0  # Expenses with 0 revenue
    else:
        expense_ratio = 0.0

    # Average transaction value
    avg_transaction_value = sum(amounts) / len(amounts) if amounts else 0.0

    # Monthly revenue standard deviation and consistency
    rev_vals = [monthly_rev[m] for m in all_months]
    if len(rev_vals) > 1:
        rev_mean = sum(rev_vals) / len(rev_vals)
        rev_var = sum((x - rev_mean) ** 2 for x in rev_vals) / len(rev_vals)
        revenue_std = math.sqrt(rev_var)
        cv = (revenue_std / rev_mean) if rev_mean > 0 else 1.0
        # Lower CV means higher consistency; clamp to [0.0, 1.0]
        revenue_consistency = max(0.0, min(1.0, 1.0 - min(cv, 1.0)))
    else:
        revenue_std = 0.0
        revenue_consistency = 0.8 if avg_monthly_revenue > 0 else 0.0

    # Cash-flow volatility (std dev of monthly net cash flow)
    net_vals = [monthly_rev[m] - monthly_exp[m] for m in all_months]
    if len(net_vals) > 1:
        net_mean = sum(net_vals) / len(net_vals)
        net_var = sum((x - net_mean) ** 2 for x in net_vals) / len(net_vals)
        cash_flow_volatility = math.sqrt(net_var)
    else:
        cash_flow_volatility = 0.0

    # Positive cash flow months ratio
    pos_months = sum(1 for m in all_months if monthly_rev[m] >= monthly_exp[m])
    positive_cash_flow_months_ratio = pos_months / n_months

    # Transaction frequency (transactions per active month)
    transaction_frequency = len(tx_list) / n_months

    # Repayment capacity: surplus margin ratio
    # If revenue is positive: net_cash_flow / avg_monthly_revenue, clamped to [-1.0, 1.0]
    if avg_monthly_revenue > 0:
        raw_margin = net_cash_flow / avg_monthly_revenue
        repayment_capacity = max(-1.0, min(1.0, raw_margin))
    else:
        repayment_capacity = -1.0 if avg_monthly_expense > 0 else 0.0

    # Fraud alert rate: proportion of transactions with high or medium alerts
    # If fraud alerts are provided:
    fraud_alert_rate = 0.0
    if alert_list:
        flagged_count = 0
        for alert in alert_list:
            if isinstance(alert, dict):
                level = str(alert.get("risk_level", "")).upper()
                score = _to_float(alert.get("risk_score", 0))
            else:
                level = str(getattr(alert, "risk_level", "")).upper()
                score = _to_float(getattr(alert, "risk_score", 0))

            if level in ("HIGH", "MEDIUM") or score >= 40:
                flagged_count += 1
        # Rate relative to analyzed transactions
        fraud_alert_rate = min(1.0, flagged_count / max(len(tx_list), len(alert_list), 1))

    return BusinessCreditFeatures(
        avg_monthly_revenue=round(avg_monthly_revenue, 2),
        revenue_std=round(revenue_std, 2),
        avg_monthly_expense=round(avg_monthly_expense, 2),
        expense_ratio=round(expense_ratio, 4),
        net_cash_flow=round(net_cash_flow, 2),
        cash_flow_volatility=round(cash_flow_volatility, 2),
        transaction_frequency=round(transaction_frequency, 2),
        avg_transaction_value=round(avg_transaction_value, 2),
        revenue_consistency=round(revenue_consistency, 4),
        fraud_alert_rate=round(fraud_alert_rate, 4),
        repayment_capacity=round(repayment_capacity, 4),
        positive_cash_flow_months_ratio=round(positive_cash_flow_months_ratio, 4),
        active_months=n_months,
        total_transactions=len(tx_list),
        total_credits=total_credits,
        total_debits=total_debits,
        business_age_years=business_age_years,
        annual_turnover=annual_turnover,
    )
