"""
FINBRIDGE — Analytics Service Unit Tests (Part 03)
Tests are pure-function — no async DB required.
We build minimal Transaction stubs in-memory and verify calculations.
"""

from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.services.analytics import (
    compute_cashflow,
    compute_expenses,
    compute_financial_summary,
    compute_revenue_trend,
    _mean,
    _std_dev,
    _coefficient_of_variation,
)


# ---------------------------------------------------------------------------
# Helpers — build fake Transaction objects
# ---------------------------------------------------------------------------


def make_txn(
    txn_date: str,
    amount: float,
    txn_type: str,
    category: str = "Miscellaneous",
) -> SimpleNamespace:
    """Return a lightweight namespace that looks like a Transaction ORM row."""
    return SimpleNamespace(
        transaction_date=date.fromisoformat(txn_date),
        amount=Decimal(str(amount)),
        transaction_type=txn_type,
        category=category,
    )


# ---------------------------------------------------------------------------
# Helper function tests
# ---------------------------------------------------------------------------


class TestHelpers:
    def test_mean_empty(self):
        assert _mean([]) == Decimal("0")

    def test_mean_values(self):
        vals = [Decimal("10"), Decimal("20"), Decimal("30")]
        assert _mean(vals) == Decimal("20")

    def test_std_dev_single(self):
        assert _std_dev([Decimal("5")]) == Decimal("0")

    def test_std_dev_identical(self):
        vals = [Decimal("7"), Decimal("7"), Decimal("7")]
        assert _std_dev(vals) == Decimal("0")

    def test_std_dev_known(self):
        # Population std-dev of [2, 4, 4, 4, 5, 5, 7, 9] = 2.0
        vals = [Decimal(str(v)) for v in [2, 4, 4, 4, 5, 5, 7, 9]]
        result = float(_std_dev(vals))
        assert abs(result - 2.0) < 0.01

    def test_cv_zero_mean(self):
        assert _coefficient_of_variation([Decimal("0"), Decimal("0")]) == Decimal("0")

    def test_cv_consistent(self):
        # All equal → std-dev = 0 → CV = 0
        vals = [Decimal("100")] * 6
        assert _coefficient_of_variation(vals) == Decimal("0")


# ---------------------------------------------------------------------------
# compute_financial_summary
# ---------------------------------------------------------------------------


class TestFinancialSummary:
    def test_empty_transactions(self):
        summary = compute_financial_summary([])
        assert summary.monthly_revenue == Decimal("0")
        assert summary.monthly_expenses == Decimal("0")
        assert summary.net_cash_flow == Decimal("0")
        assert summary.transaction_count == 0

    def test_revenue_only(self):
        txns = [
            make_txn("2026-01-05", 10000, "credit", "Revenue"),
            make_txn("2026-02-05", 12000, "credit", "Revenue"),
        ]
        s = compute_financial_summary(txns)
        assert s.total_revenue == Decimal("22000")
        assert s.total_expenses == Decimal("0")
        assert s.monthly_revenue == Decimal("11000")   # avg over 2 months
        assert s.net_cash_flow == Decimal("11000")
        assert s.expense_ratio == Decimal("0")
        assert s.transaction_count == 2

    def test_expenses_only(self):
        txns = [make_txn("2026-01-10", 5000, "debit", "Rent")]
        s = compute_financial_summary(txns)
        assert s.total_expenses == Decimal("5000")
        assert s.total_revenue == Decimal("0")
        assert s.monthly_expenses == Decimal("5000")
        assert s.net_cash_flow == Decimal("-5000")

    def test_mixed_transactions(self):
        txns = [
            make_txn("2026-01-05", 50000, "credit", "Revenue"),
            make_txn("2026-01-15", 10000, "debit", "Rent"),
            make_txn("2026-01-20", 5000, "debit", "Utilities"),
            make_txn("2026-02-05", 60000, "credit", "Revenue"),
            make_txn("2026-02-15", 10000, "debit", "Rent"),
        ]
        s = compute_financial_summary(txns)
        assert s.total_revenue == Decimal("110000")
        assert s.total_expenses == Decimal("25000")
        # 2 months → avg monthly revenue = 55000
        assert s.monthly_revenue == Decimal("55000")
        assert s.monthly_expenses == Decimal("12500")
        assert s.net_cash_flow == Decimal("42500")
        # expense_ratio = 12500 / 55000 ≈ 0.23
        assert float(s.expense_ratio) == pytest.approx(12500 / 55000, abs=0.01)

    def test_expense_ratio_correct(self):
        txns = [
            make_txn("2026-01-05", 100000, "credit", "Revenue"),
            make_txn("2026-01-10", 40000, "debit", "Salary"),
        ]
        s = compute_financial_summary(txns)
        assert s.expense_ratio == Decimal("0.40")

    def test_net_cash_flow_negative(self):
        txns = [
            make_txn("2026-01-05", 20000, "credit", "Revenue"),
            make_txn("2026-01-10", 30000, "debit", "Salary"),
        ]
        s = compute_financial_summary(txns)
        assert s.net_cash_flow == Decimal("-10000")

    def test_average_transaction_value(self):
        txns = [
            make_txn("2026-01-05", 10000, "credit"),
            make_txn("2026-01-10", 20000, "debit"),
            make_txn("2026-01-15", 30000, "credit"),
        ]
        s = compute_financial_summary(txns)
        assert s.average_transaction_value == Decimal("20000")

    def test_revenue_consistency_single_month(self):
        # One month → std-dev = 0 → CV = 0
        txns = [make_txn("2026-01-05", 50000, "credit")]
        s = compute_financial_summary(txns)
        assert s.revenue_consistency == Decimal("0")

    def test_cash_flow_volatility_stable(self):
        # Same net each month → volatility = 0
        txns = [
            make_txn("2026-01-05", 50000, "credit"),
            make_txn("2026-01-10", 20000, "debit"),
            make_txn("2026-02-05", 50000, "credit"),
            make_txn("2026-02-10", 20000, "debit"),
        ]
        s = compute_financial_summary(txns)
        assert s.cash_flow_volatility == Decimal("0")


# ---------------------------------------------------------------------------
# compute_cashflow
# ---------------------------------------------------------------------------


class TestCashflow:
    def test_empty(self):
        result = compute_cashflow([])
        assert result.months == []

    def test_single_month(self):
        txns = [
            make_txn("2026-01-05", 50000, "credit"),
            make_txn("2026-01-10", 20000, "debit"),
        ]
        result = compute_cashflow(txns)
        assert len(result.months) == 1
        m = result.months[0]
        assert m.month == "2026-01"
        assert m.revenue == Decimal("50000")
        assert m.expenses == Decimal("20000")
        assert m.net == Decimal("30000")

    def test_chronological_order(self):
        txns = [
            make_txn("2026-03-01", 10000, "credit"),
            make_txn("2026-01-01", 5000, "credit"),
            make_txn("2026-02-01", 8000, "credit"),
        ]
        result = compute_cashflow(txns)
        months = [m.month for m in result.months]
        assert months == ["2026-01", "2026-02", "2026-03"]

    def test_net_negative_month(self):
        txns = [
            make_txn("2026-05-05", 10000, "credit"),
            make_txn("2026-05-10", 30000, "debit"),
        ]
        result = compute_cashflow(txns)
        assert result.months[0].net == Decimal("-20000")


# ---------------------------------------------------------------------------
# compute_expenses
# ---------------------------------------------------------------------------


class TestExpenses:
    def test_empty(self):
        result = compute_expenses([])
        assert result.categories == []
        assert result.total_expenses == Decimal("0")

    def test_credits_excluded(self):
        txns = [make_txn("2026-01-05", 50000, "credit", "Revenue")]
        result = compute_expenses(txns)
        assert result.total_expenses == Decimal("0")
        assert result.categories == []

    def test_single_category(self):
        txns = [
            make_txn("2026-01-10", 10000, "debit", "Rent"),
            make_txn("2026-02-10", 10000, "debit", "Rent"),
        ]
        result = compute_expenses(txns)
        assert result.total_expenses == Decimal("20000")
        assert len(result.categories) == 1
        cat = result.categories[0]
        assert cat.category == "Rent"
        assert cat.total == Decimal("20000")
        assert cat.percentage == Decimal("100.00")
        assert cat.transaction_count == 2

    def test_multiple_categories_percentages(self):
        txns = [
            make_txn("2026-01-01", 60000, "debit", "Salary"),
            make_txn("2026-01-02", 20000, "debit", "Rent"),
            make_txn("2026-01-03", 20000, "debit", "Inventory"),
        ]
        result = compute_expenses(txns)
        assert result.total_expenses == Decimal("100000")
        # Sorted by total desc → Salary (60%), Rent (20%), Inventory (20%)
        cats = {c.category: c for c in result.categories}
        assert float(cats["Salary"].percentage) == pytest.approx(60.0, abs=0.01)
        assert float(cats["Rent"].percentage) == pytest.approx(20.0, abs=0.01)

    def test_sorted_by_total_desc(self):
        txns = [
            make_txn("2026-01-01", 1000, "debit", "Utilities"),
            make_txn("2026-01-02", 5000, "debit", "Salary"),
            make_txn("2026-01-03", 3000, "debit", "Rent"),
        ]
        result = compute_expenses(txns)
        totals = [c.total for c in result.categories]
        assert totals == sorted(totals, reverse=True)


# ---------------------------------------------------------------------------
# compute_revenue_trend
# ---------------------------------------------------------------------------


class TestRevenueTrend:
    def test_empty(self):
        result = compute_revenue_trend([])
        assert result.trend == []
        assert result.average_monthly_revenue == Decimal("0")

    def test_debits_excluded(self):
        txns = [make_txn("2026-01-10", 5000, "debit", "Rent")]
        result = compute_revenue_trend(txns)
        assert result.trend == []

    def test_three_months(self):
        txns = [
            make_txn("2026-01-05", 50000, "credit", "Revenue"),
            make_txn("2026-02-05", 60000, "credit", "Revenue"),
            make_txn("2026-03-05", 70000, "credit", "Revenue"),
        ]
        result = compute_revenue_trend(txns)
        assert len(result.trend) == 3
        assert result.trend[0].revenue == Decimal("50000")
        assert result.trend[1].revenue == Decimal("60000")
        assert result.trend[2].revenue == Decimal("70000")
        assert result.average_monthly_revenue == Decimal("60000")

    def test_multiple_credits_same_month(self):
        txns = [
            make_txn("2026-01-05", 30000, "credit", "Revenue"),
            make_txn("2026-01-20", 20000, "credit", "Revenue"),
        ]
        result = compute_revenue_trend(txns)
        assert len(result.trend) == 1
        assert result.trend[0].revenue == Decimal("50000")
        assert result.trend[0].transaction_count == 2
