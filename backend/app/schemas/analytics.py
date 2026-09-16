"""
FINBRIDGE — Analytics Pydantic Schemas (Part 03)
Response shapes for all FT-05 analytics endpoints.
All values are computed server-side; the frontend only renders.
"""

from decimal import Decimal

from app.schemas.common import BaseSchema


# ---------------------------------------------------------------------------
# Financial Summary  (GET /analytics/summary)
# ---------------------------------------------------------------------------


class FinancialSummary(BaseSchema):
    """
    Aggregated financial health snapshot for a business.
    All monetary values are in INR.
    """

    monthly_revenue: Decimal        # Avg monthly credit across full dataset
    monthly_expenses: Decimal       # Avg monthly debit across full dataset
    net_cash_flow: Decimal          # monthly_revenue − monthly_expenses
    expense_ratio: Decimal          # monthly_expenses / monthly_revenue (0–1)
    average_transaction_value: Decimal  # Mean abs transaction amount
    revenue_consistency: Decimal    # Coefficient of variation (lower = more consistent)
    cash_flow_volatility: Decimal   # Std-dev of monthly net cash flow
    transaction_count: int
    total_revenue: Decimal
    total_expenses: Decimal


# ---------------------------------------------------------------------------
# Cash Flow  (GET /analytics/cashflow)
# ---------------------------------------------------------------------------


class CashflowDataPoint(BaseSchema):
    """Monthly credit, debit, and net values for a single month."""

    month: str          # e.g. "2026-01"
    revenue: Decimal
    expenses: Decimal
    net: Decimal


class CashflowResponse(BaseSchema):
    months: list[CashflowDataPoint]


# ---------------------------------------------------------------------------
# Expenses  (GET /analytics/expenses)
# ---------------------------------------------------------------------------


class ExpenseCategory(BaseSchema):
    """Expense breakdown per category."""

    category: str
    total: Decimal
    percentage: Decimal     # Share of total expenses (0–100)
    transaction_count: int


class ExpensesResponse(BaseSchema):
    categories: list[ExpenseCategory]
    total_expenses: Decimal


# ---------------------------------------------------------------------------
# Revenue Trend  (GET /analytics/revenue-trend)
# ---------------------------------------------------------------------------


class RevenueTrendPoint(BaseSchema):
    """Monthly revenue for trend chart."""

    month: str      # e.g. "2026-01"
    revenue: Decimal
    transaction_count: int


class RevenueTrendResponse(BaseSchema):
    trend: list[RevenueTrendPoint]
    average_monthly_revenue: Decimal
