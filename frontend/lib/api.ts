/**
 * FINBRIDGE — Typed API Client (Part 03)
 * Extends Part 02 with transaction upload and analytics endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message: string;
  data?: T;
  errors?: { field?: string; message: string }[];
  detail?: string; // FastAPI error detail
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  firebase_uid: string;
  is_active: boolean;
  created_at: string;
  has_business: boolean;
}

export interface AuthApiResponse {
  user: UserResponse;
  message: string;
}

export interface BusinessResponse {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  location: string | null;
  business_age: number | null;
  annual_turnover: string | null;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Transaction types
// ─────────────────────────────────────────────

export interface TransactionResponse {
  id: string;
  business_id: string;
  transaction_date: string; // ISO date string
  amount: string;           // Decimal as string
  transaction_type: "credit" | "debit";
  category: string;
  merchant: string | null;
  description: string | null;
  timestamp: string | null;
  created_at: string;
}

export interface RowError {
  row: number;
  reason: string;
}

export interface UploadSummary {
  total_rows: number;
  accepted_rows: number;
  rejected_rows: number;
  errors: RowError[];
  message: string;
}

export interface TransactionListResponse {
  transactions: TransactionResponse[];
  total: number;
  limit: number;
  offset: number;
}

// ─────────────────────────────────────────────
// Analytics types
// ─────────────────────────────────────────────

export interface FinancialSummary {
  monthly_revenue: string;
  monthly_expenses: string;
  net_cash_flow: string;
  expense_ratio: string;
  average_transaction_value: string;
  revenue_consistency: string;
  cash_flow_volatility: string;
  transaction_count: number;
  total_revenue: string;
  total_expenses: string;
}

export interface CashflowDataPoint {
  month: string;
  revenue: string;
  expenses: string;
  net: string;
}

export interface CashflowResponse {
  months: CashflowDataPoint[];
}

export interface ExpenseCategory {
  category: string;
  total: string;
  percentage: string;
  transaction_count: number;
}

export interface ExpensesResponse {
  categories: ExpenseCategory[];
  total_expenses: string;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: string;
  transaction_count: number;
}

export interface RevenueTrendResponse {
  trend: RevenueTrendPoint[];
  average_monthly_revenue: string;
}

// ─────────────────────────────────────────────
// Base request helper
// ─────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  idToken?: string
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.detail ?? body.message ?? `HTTP ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

// ─────────────────────────────────────────────
// Auth endpoints
// ─────────────────────────────────────────────

export async function registerUser(
  idToken: string,
  name: string,
  email: string
): Promise<AuthApiResponse> {
  return request<AuthApiResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ firebase_id_token: idToken, name, email }),
  });
}

export async function loginUser(idToken: string): Promise<AuthApiResponse> {
  return request<AuthApiResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ firebase_id_token: idToken }),
  });
}

export async function getMe(idToken: string): Promise<UserResponse> {
  return request<UserResponse>("/api/v1/auth/me", {}, idToken);
}

// ─────────────────────────────────────────────
// Business endpoints
// ─────────────────────────────────────────────

export interface BusinessPayload {
  business_name: string;
  business_type?: string;
  location?: string;
  business_age?: number;
  annual_turnover?: string;
}

export async function createBusiness(
  idToken: string,
  data: BusinessPayload
): Promise<BusinessResponse> {
  return request<BusinessResponse>(
    "/api/v1/business/profile",
    { method: "POST", body: JSON.stringify(data) },
    idToken
  );
}

export async function getBusiness(idToken: string): Promise<BusinessResponse> {
  return request<BusinessResponse>("/api/v1/business/profile", {}, idToken);
}

export async function updateBusiness(
  idToken: string,
  data: Partial<BusinessPayload>
): Promise<BusinessResponse> {
  return request<BusinessResponse>(
    "/api/v1/business/profile",
    { method: "PUT", body: JSON.stringify(data) },
    idToken
  );
}

// ─────────────────────────────────────────────
// Transaction endpoints  (Part 03)
// ─────────────────────────────────────────────

/** Upload a CSV file of transactions. Returns upload summary. */
export async function uploadTransactionsCsv(
  idToken: string,
  file: File
): Promise<UploadSummary> {
  const url = `${API_BASE}/api/v1/transactions/upload`;
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.detail ?? body.message ?? `HTTP ${response.status}`,
      response.status
    );
  }

  return response.json();
}

/** List transactions for the authenticated business (paginated). */
export async function getTransactions(
  idToken: string,
  limit = 100,
  offset = 0
): Promise<TransactionListResponse> {
  return request<TransactionListResponse>(
    `/api/v1/transactions/?limit=${limit}&offset=${offset}`,
    {},
    idToken
  );
}

// ─────────────────────────────────────────────
// Analytics endpoints  (Part 03)
// ─────────────────────────────────────────────

export async function getAnalyticsSummary(
  idToken: string
): Promise<FinancialSummary> {
  return request<FinancialSummary>("/api/v1/analytics/summary", {}, idToken);
}

export async function getAnalyticsCashflow(
  idToken: string
): Promise<CashflowResponse> {
  return request<CashflowResponse>("/api/v1/analytics/cashflow", {}, idToken);
}

export async function getAnalyticsExpenses(
  idToken: string
): Promise<ExpensesResponse> {
  return request<ExpensesResponse>("/api/v1/analytics/expenses", {}, idToken);
}

export async function getAnalyticsRevenueTrend(
  idToken: string
): Promise<RevenueTrendResponse> {
  return request<RevenueTrendResponse>(
    "/api/v1/analytics/revenue-trend",
    {},
    idToken
  );
}
