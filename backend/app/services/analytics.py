"""
FINBRIDGE — Analytics Service (Part 03)
Computes all FT-05 financial metrics server-side.
No ML / AI — pure deterministic Python math.

Metrics produced:
  summary:       monthly_revenue, monthly_expenses, net_cash_flow,
                 expense_ratio, average_transaction_value,
                 revenue_consistency (CV), cash_flow_volatility (std-dev)
  cashflow:      per-month credit / debit / net
  expenses:      per-category totals and percentages
  revenue_trend: per-month revenue
"""

import uuid
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from math import sqrt

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.schemas.analytics import (
    CashflowDataPoint,
    CashflowResponse,
    ExpenseCategory,
    ExpensesResponse,
    FinancialSummary,
    RevenueTrendPoint,
    RevenueTrendResponse,
)
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.analytics")

ZERO = Decimal("0")
ONE_HUNDRED = Decimal("100")


# ---------------------------------------------------------------------------
# Pure calculation helpers (importable for unit testing)
# ---------------------------------------------------------------------------


def _mean(values: list[Decimal]) -> Decimal:
    if not values:
        return ZERO
    return sum(values, ZERO) / Decimal(len(values))


def _std_dev(values: list[Decimal]) -> Decimal:
    """Population standard deviation."""
    if len(values) < 2:
        return ZERO
    mu = _mean(values)
    variance = sum((v - mu) ** 2 for v in values) / Decimal(len(values))
    return Decimal(str(sqrt(float(variance))))


def _coefficient_of_variation(values: list[Decimal]) -> Decimal:
    """CV = std_dev / mean — lower means more consistent. Capped at 2.00."""
    mu = _mean(values)
    if mu == ZERO:
        return ZERO
    return min(_std_dev(values) / mu, Decimal("2.00"))


def _round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_financial_summary(transactions: list[Transaction]) -> FinancialSummary:
    """
    Pure function — accepts a list of Transaction ORM objects.
    Returns a fully computed FinancialSummary.
    """
    if not transactions:
        return FinancialSummary(
            monthly_revenue=ZERO,
            monthly_expenses=ZERO,
            net_cash_flow=ZERO,
            expense_ratio=ZERO,
            average_transaction_value=ZERO,
            revenue_consistency=ZERO,
            cash_flow_volatility=ZERO,
            transaction_count=0,
            total_revenue=ZERO,
            total_expenses=ZERO,
        )

    # Aggregate by month
    monthly_revenue: dict[str, Decimal] = defaultdict(lambda: ZERO)
    monthly_expenses: dict[str, Decimal] = defaultdict(lambda: ZERO)

    total_revenue = ZERO
    total_expenses = ZERO
    amounts: list[Decimal] = []

    for txn in transactions:
        month_key = txn.transaction_date.strftime("%Y-%m")
        amt = Decimal(str(txn.amount))
        amounts.append(amt)

        if txn.transaction_type == "credit":
            monthly_revenue[month_key] += amt
            total_revenue += amt
        else:
            monthly_expenses[month_key] += amt
            total_expenses += amt

    # Gather all months that appear in either dict
    all_months = sorted(set(monthly_revenue) | set(monthly_expenses))
    n_months = Decimal(max(len(all_months), 1))

    avg_monthly_revenue = total_revenue / n_months
    avg_monthly_expenses = total_expenses / n_months
    net_cash_flow = avg_monthly_revenue - avg_monthly_expenses

    expense_ratio = (
        avg_monthly_expenses / avg_monthly_revenue
        if avg_monthly_revenue > ZERO
        else ZERO
    )

    avg_txn_value = _mean(amounts)

    # Revenue consistency — CV of monthly revenue
    rev_values = [monthly_revenue.get(m, ZERO) for m in all_months]
    revenue_consistency = _coefficient_of_variation(rev_values)

    # Cash-flow volatility — std-dev of monthly net
    net_values = [
        monthly_revenue.get(m, ZERO) - monthly_expenses.get(m, ZERO)
        for m in all_months
    ]
    cf_volatility = _std_dev(net_values)

    return FinancialSummary(
        monthly_revenue=_round2(avg_monthly_revenue),
        monthly_expenses=_round2(avg_monthly_expenses),
        net_cash_flow=_round2(net_cash_flow),
        expense_ratio=_round2(expense_ratio),
        average_transaction_value=_round2(avg_txn_value),
        revenue_consistency=_round2(revenue_consistency),
        cash_flow_volatility=_round2(cf_volatility),
        transaction_count=len(transactions),
        total_revenue=_round2(total_revenue),
        total_expenses=_round2(total_expenses),
    )


def compute_cashflow(transactions: list[Transaction]) -> CashflowResponse:
    """Build a month-by-month credit / debit / net series."""
    monthly_rev: dict[str, Decimal] = defaultdict(lambda: ZERO)
    monthly_exp: dict[str, Decimal] = defaultdict(lambda: ZERO)

    for txn in transactions:
        month_key = txn.transaction_date.strftime("%Y-%m")
        amt = Decimal(str(txn.amount))
        if txn.transaction_type == "credit":
            monthly_rev[month_key] += amt
        else:
            monthly_exp[month_key] += amt

    all_months = sorted(set(monthly_rev) | set(monthly_exp))
    points = [
        CashflowDataPoint(
            month=m,
            revenue=_round2(monthly_rev.get(m, ZERO)),
            expenses=_round2(monthly_exp.get(m, ZERO)),
            net=_round2(monthly_rev.get(m, ZERO) - monthly_exp.get(m, ZERO)),
        )
        for m in all_months
    ]
    return CashflowResponse(months=points)


def compute_expenses(transactions: list[Transaction]) -> ExpensesResponse:
    """Break down expenses by category with percentage share."""
    cat_totals: dict[str, Decimal] = defaultdict(lambda: ZERO)
    cat_counts: dict[str, int] = defaultdict(int)

    for txn in transactions:
        if txn.transaction_type == "debit":
            cat_totals[txn.category] += Decimal(str(txn.amount))
            cat_counts[txn.category] += 1

    total_expenses = sum(cat_totals.values(), ZERO)

    categories = []
    for cat, total in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True):
        pct = (total / total_expenses * ONE_HUNDRED) if total_expenses > ZERO else ZERO
        categories.append(
            ExpenseCategory(
                category=cat,
                total=_round2(total),
                percentage=_round2(pct),
                transaction_count=cat_counts[cat],
            )
        )

    return ExpensesResponse(
        categories=categories,
        total_expenses=_round2(total_expenses),
    )


def compute_revenue_trend(transactions: list[Transaction]) -> RevenueTrendResponse:
    """Monthly revenue aggregation for trend chart."""
    monthly_rev: dict[str, Decimal] = defaultdict(lambda: ZERO)
    monthly_cnt: dict[str, int] = defaultdict(int)

    for txn in transactions:
        if txn.transaction_type == "credit":
            month_key = txn.transaction_date.strftime("%Y-%m")
            monthly_rev[month_key] += Decimal(str(txn.amount))
            monthly_cnt[month_key] += 1

    months = sorted(monthly_rev)
    trend = [
        RevenueTrendPoint(
            month=m,
            revenue=_round2(monthly_rev[m]),
            transaction_count=monthly_cnt[m],
        )
        for m in months
    ]
    avg = _mean(list(monthly_rev.values())) if monthly_rev else ZERO
    return RevenueTrendResponse(trend=trend, average_monthly_revenue=_round2(avg))


# ---------------------------------------------------------------------------
# Service (async, DB-backed)
# ---------------------------------------------------------------------------


class AnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def _fetch_transactions(self, business_id: uuid.UUID) -> list[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.business_id == business_id)
            .order_by(Transaction.transaction_date.asc())
        )
        return list(result.scalars().all())

    async def get_summary(self, business_id: uuid.UUID) -> FinancialSummary:
        txns = await self._fetch_transactions(business_id)
        return compute_financial_summary(txns)

    async def get_cashflow(self, business_id: uuid.UUID) -> CashflowResponse:
        txns = await self._fetch_transactions(business_id)
        return compute_cashflow(txns)

    async def get_expenses(self, business_id: uuid.UUID) -> ExpensesResponse:
        txns = await self._fetch_transactions(business_id)
        return compute_expenses(txns)

    async def get_revenue_trend(self, business_id: uuid.UUID) -> RevenueTrendResponse:
        txns = await self._fetch_transactions(business_id)
        return compute_revenue_trend(txns)
