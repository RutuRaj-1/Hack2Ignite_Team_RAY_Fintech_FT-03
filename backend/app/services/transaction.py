"""
FINBRIDGE — Transaction Service (Part 03)
Handles CSV upload, row validation, deterministic categorization,
bulk insert, and paginated retrieval.

No LLM is used for categorization — pure keyword matching.
"""

import csv
import io
import uuid
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import TRANSACTION_CATEGORIES, TRANSACTION_TYPES, Transaction
from app.schemas.transaction import RowError, TransactionListResponse, TransactionResponse, UploadSummary
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.transaction")

# ---------------------------------------------------------------------------
# Required CSV columns (case-insensitive after strip)
# ---------------------------------------------------------------------------

REQUIRED_COLUMNS = {"date", "description", "amount", "type", "merchant"}

# ---------------------------------------------------------------------------
# Deterministic keyword-based categorizer
# ---------------------------------------------------------------------------

# Maps category → list of lowercase trigger keywords.
# Evaluated top-to-bottom; first match wins.
_CATEGORY_KEYWORDS: list[tuple[str, list[str]]] = [
    ("Revenue", [
        "payment received", "customer payment", "sale", "invoice payment",
        "receipt", "revenue", "income", "collection", "client payment",
        "customer", "receivable",
    ]),
    ("Inventory", [
        "inventory", "stock purchase", "raw material", "goods purchase",
        "merchandise", "product purchase", "material",
    ]),
    ("Rent", [
        "rent", "lease", "office space", "shop rent", "warehouse rent",
    ]),
    ("Utilities", [
        "electricity", "power bill", "water bill", "internet", "broadband",
        "utility", "gas bill", "telephone",
    ]),
    ("Salary", [
        "salary", "payroll", "wages", "staff payment", "employee",
        "stipend", "compensation",
    ]),
    ("Marketing", [
        "marketing", "advertising", "advertisement", "ad spend",
        "promotion", "campaign", "social media",
    ]),
    ("Transportation", [
        "transport", "freight", "courier", "delivery", "fuel",
        "logistics", "shipping", "travel",
    ]),
    ("Loan Payment", [
        "loan", "emi", "repayment", "installment", "bank loan",
        "credit repayment", "principal",
    ]),
]


def categorize(description: str, merchant: str) -> str:
    """
    Return a category string for the given description and merchant.
    Checks description first, then merchant. Falls back to 'Miscellaneous'.
    """
    haystack = f"{description} {merchant}".lower()
    for category, keywords in _CATEGORY_KEYWORDS:
        for kw in keywords:
            if kw in haystack:
                return category
    return "Miscellaneous"


# ---------------------------------------------------------------------------
# Date normalization
# ---------------------------------------------------------------------------

_DATE_FORMATS = [
    "%Y-%m-%d",
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%m/%d/%Y",
    "%d %b %Y",
    "%d %B %Y",
    "%Y/%m/%d",
]


def parse_date(raw: str) -> date | None:
    """Try multiple date formats; return None if none match."""
    raw = raw.strip()
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    return None


# ---------------------------------------------------------------------------
# Transaction type normalization
# ---------------------------------------------------------------------------

_TYPE_MAP = {
    "credit": "credit",
    "cr": "credit",
    "in": "credit",
    "income": "credit",
    "debit": "debit",
    "dr": "debit",
    "out": "debit",
    "expense": "debit",
}


def normalize_type(raw: str) -> str | None:
    """Normalize transaction type to 'credit' | 'debit'. Returns None if unknown."""
    return _TYPE_MAP.get(raw.strip().lower())


# ---------------------------------------------------------------------------
# Amount validation
# ---------------------------------------------------------------------------


def parse_amount(raw: str) -> Decimal | None:
    """Strip currency symbols/commas, return positive Decimal or None."""
    cleaned = raw.strip().replace(",", "").replace("₹", "").replace("$", "").replace("Rs.", "").replace("Rs", "")
    try:
        val = Decimal(cleaned)
        return abs(val)          # Always positive; type encodes direction
    except InvalidOperation:
        return None


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class TransactionService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ------------------------------------------------------------------
    # CSV Upload
    # ------------------------------------------------------------------

    async def upload_csv(
        self,
        business_id: uuid.UUID,
        file_bytes: bytes,
        filename: str,
    ) -> UploadSummary:
        """
        Parse, validate, categorize, and bulk-insert transactions from CSV.

        Expected columns: date, description, amount, type, merchant
        Returns UploadSummary with per-row error details.
        """
        # 1. Validate file type
        if not filename.lower().endswith(".csv"):
            raise ValueError("Only .csv files are accepted.")

        # 2. Decode and detect columns
        try:
            text = file_bytes.decode("utf-8-sig")   # handle BOM
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1")

        reader = csv.DictReader(io.StringIO(text))

        if reader.fieldnames is None:
            raise ValueError("CSV file is empty or has no header row.")

        # Normalise header names
        normalized_headers = {h.strip().lower() for h in reader.fieldnames}
        missing = REQUIRED_COLUMNS - normalized_headers
        if missing:
            raise ValueError(
                f"CSV is missing required columns: {', '.join(sorted(missing))}. "
                f"Required: {', '.join(sorted(REQUIRED_COLUMNS))}"
            )

        # Build column name map (original → normalised)
        col_map: dict[str, str] = {}
        for h in reader.fieldnames:
            col_map[h.strip().lower()] = h

        def get(row: dict, col: str) -> str:
            return row.get(col_map.get(col, col), "").strip()

        # 3. Parse rows
        rows_to_insert: list[Transaction] = []
        errors: list[RowError] = []
        total_rows = 0

        for row_num, raw_row in enumerate(reader, start=2):  # header = row 1
            total_rows += 1

            # --- date ---
            raw_date = get(raw_row, "date")
            txn_date = parse_date(raw_date)
            if txn_date is None:
                errors.append(RowError(row=row_num, reason=f"Invalid date: '{raw_date}'"))
                continue

            # --- type ---
            raw_type = get(raw_row, "type")
            txn_type = normalize_type(raw_type)
            if txn_type is None:
                errors.append(RowError(
                    row=row_num,
                    reason=f"Unknown transaction type: '{raw_type}'. Use credit/debit."
                ))
                continue

            # --- amount ---
            raw_amount = get(raw_row, "amount")
            txn_amount = parse_amount(raw_amount)
            if txn_amount is None or txn_amount <= 0:
                errors.append(RowError(row=row_num, reason=f"Invalid amount: '{raw_amount}'"))
                continue

            # --- optional fields ---
            description = get(raw_row, "description") or None
            merchant = get(raw_row, "merchant") or None

            # --- categorize ---
            category = categorize(description or "", merchant or "")

            rows_to_insert.append(
                Transaction(
                    business_id=business_id,
                    transaction_date=txn_date,
                    amount=txn_amount,
                    transaction_type=txn_type,
                    category=category,
                    merchant=merchant,
                    description=description,
                )
            )

        # 4. Bulk insert valid rows
        if rows_to_insert:
            self.db.add_all(rows_to_insert)
            await self.db.flush()

        accepted = len(rows_to_insert)
        rejected = len(errors)

        logger.info(
            "CSV upload complete",
            business_id=str(business_id),
            accepted=accepted,
            rejected=rejected,
        )

        return UploadSummary(
            total_rows=total_rows,
            accepted_rows=accepted,
            rejected_rows=rejected,
            errors=errors,
            message=(
                f"Upload complete: {accepted} rows accepted, {rejected} rows rejected."
            ),
        )

    # ------------------------------------------------------------------
    # List
    # ------------------------------------------------------------------

    async def list_for_business(
        self,
        business_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> TransactionListResponse:
        """Return a paginated list of transactions for a business."""
        # Count
        count_result = await self.db.execute(
            select(func.count()).where(Transaction.business_id == business_id)
        )
        total = count_result.scalar_one()

        # Fetch
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.business_id == business_id)
            .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        txns = result.scalars().all()

        return TransactionListResponse(
            transactions=[TransactionResponse.model_validate(t) for t in txns],
            total=total,
            limit=limit,
            offset=offset,
        )
