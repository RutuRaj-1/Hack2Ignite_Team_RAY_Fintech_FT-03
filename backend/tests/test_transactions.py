"""
FINBRIDGE — Transaction Service Unit Tests (Part 03)
Tests CSV validation, column detection, date/type normalization,
amount parsing, and categorization.
"""

import io

import pytest

from app.services.transaction import (
    REQUIRED_COLUMNS,
    categorize,
    normalize_type,
    parse_amount,
    parse_date,
)

# ---------------------------------------------------------------------------
# parse_date
# ---------------------------------------------------------------------------


class TestParseDate:
    def test_iso_format(self):
        result = parse_date("2026-01-15")
        assert str(result) == "2026-01-15"

    def test_dd_mm_yyyy_slash(self):
        result = parse_date("15/01/2026")
        assert str(result) == "2026-01-15"

    def test_dd_mm_yyyy_dash(self):
        result = parse_date("15-01-2026")
        assert str(result) == "2026-01-15"

    def test_dd_month_year(self):
        result = parse_date("15 Jan 2026")
        assert str(result) == "2026-01-15"

    def test_dd_fullmonth_year(self):
        result = parse_date("15 January 2026")
        assert str(result) == "2026-01-15"

    def test_whitespace_stripped(self):
        result = parse_date("  2026-03-10  ")
        assert str(result) == "2026-03-10"

    def test_invalid_date(self):
        assert parse_date("not-a-date") is None

    def test_empty_string(self):
        assert parse_date("") is None

    def test_partial_date(self):
        assert parse_date("2026-13") is None   # month 13 invalid


# ---------------------------------------------------------------------------
# normalize_type
# ---------------------------------------------------------------------------


class TestNormalizeType:
    def test_credit_lowercase(self):
        assert normalize_type("credit") == "credit"

    def test_credit_uppercase(self):
        assert normalize_type("CREDIT") == "credit"

    def test_debit_lowercase(self):
        assert normalize_type("debit") == "debit"

    def test_cr_alias(self):
        assert normalize_type("cr") == "credit"

    def test_dr_alias(self):
        assert normalize_type("dr") == "debit"

    def test_income_alias(self):
        assert normalize_type("income") == "credit"

    def test_expense_alias(self):
        assert normalize_type("expense") == "debit"

    def test_in_alias(self):
        assert normalize_type("in") == "credit"

    def test_out_alias(self):
        assert normalize_type("out") == "debit"

    def test_unknown(self):
        assert normalize_type("transfer") is None

    def test_whitespace(self):
        assert normalize_type("  debit  ") == "debit"


# ---------------------------------------------------------------------------
# parse_amount
# ---------------------------------------------------------------------------


class TestParseAmount:
    def test_plain_integer(self):
        from decimal import Decimal
        assert parse_amount("5000") == Decimal("5000")

    def test_decimal(self):
        from decimal import Decimal
        assert parse_amount("1234.56") == Decimal("1234.56")

    def test_with_commas(self):
        from decimal import Decimal
        assert parse_amount("1,00,000") == Decimal("100000")

    def test_with_rupee_symbol(self):
        from decimal import Decimal
        assert parse_amount("₹25000") == Decimal("25000")

    def test_negative_becomes_positive(self):
        from decimal import Decimal
        assert parse_amount("-5000") == Decimal("5000")

    def test_zero_returns_zero(self):
        from decimal import Decimal
        assert parse_amount("0") == Decimal("0")

    def test_invalid_text(self):
        assert parse_amount("abc") is None

    def test_empty(self):
        assert parse_amount("") is None


# ---------------------------------------------------------------------------
# categorize
# ---------------------------------------------------------------------------


class TestCategorize:
    def test_revenue_keywords(self):
        assert categorize("customer payment received", "") == "Revenue"
        assert categorize("invoice payment from client", "") == "Revenue"
        assert categorize("sale proceeds", "") == "Revenue"

    def test_inventory(self):
        assert categorize("stock purchase from supplier", "") == "Inventory"
        assert categorize("raw material purchase", "") == "Inventory"

    def test_rent(self):
        assert categorize("monthly rent payment", "") == "Rent"
        assert categorize("office space lease", "") == "Rent"

    def test_utilities(self):
        assert categorize("electricity bill payment", "") == "Utilities"
        assert categorize("internet broadband recharge", "") == "Utilities"

    def test_salary(self):
        assert categorize("salary disbursement to staff", "") == "Salary"
        assert categorize("payroll processing", "") == "Salary"

    def test_marketing(self):
        assert categorize("social media advertising campaign", "") == "Marketing"
        assert categorize("promotion expense", "") == "Marketing"

    def test_transportation(self):
        assert categorize("courier delivery charges", "") == "Transportation"
        assert categorize("fuel expenses", "") == "Transportation"

    def test_loan_payment(self):
        assert categorize("loan emi deduction", "") == "Loan Payment"
        assert categorize("bank loan repayment", "") == "Loan Payment"

    def test_miscellaneous_fallback(self):
        assert categorize("sundry items", "") == "Miscellaneous"
        assert categorize("", "") == "Miscellaneous"

    def test_merchant_also_matched(self):
        # Description empty but merchant contains keyword
        assert categorize("", "electricity department") == "Utilities"

    def test_case_insensitive(self):
        assert categorize("SALARY PAYMENT", "") == "Salary"
        assert categorize("RENT PAYMENT", "") == "Rent"


# ---------------------------------------------------------------------------
# CSV validation via upload_csv (requires async)
# We test column detection logic using the pure helper via import trick.
# Full upload integration is covered by conftest + async client tests.
# ---------------------------------------------------------------------------


class TestCSVColumnValidation:
    """Verify that REQUIRED_COLUMNS matches the spec."""

    def test_required_columns_present(self):
        assert "date" in REQUIRED_COLUMNS
        assert "description" in REQUIRED_COLUMNS
        assert "amount" in REQUIRED_COLUMNS
        assert "type" in REQUIRED_COLUMNS
        assert "merchant" in REQUIRED_COLUMNS

    def test_required_columns_count(self):
        assert len(REQUIRED_COLUMNS) == 5
