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

// ============================================================================
// FT-02 FRAUD & RISK INTELLIGENCE (PART 04)
// ============================================================================

export interface RuleResult {
  rule_name: string;
  triggered: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
}

export interface TransactionSummary {
  id: string;
  transaction_date: string;
  amount: number;
  transaction_type: string;
  category: string;
  merchant: string | null;
  description: string | null;
}

export interface FraudAlertResponse {
  id: string;
  transaction_id: string;
  business_id: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  detected_reasons: RuleResult[];
  model_type: string;
  status: string;
  created_at: string;
  transaction?: TransactionSummary;
}

export interface FraudAlertListResponse {
  alerts: FraudAlertResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface RiskLevelCount {
  count: number;
  percentage: number;
}

export interface FraudSummaryResponse {
  total_transactions: number;
  analyzed_transactions: number;
  low_risk: RiskLevelCount;
  medium_risk: RiskLevelCount;
  high_risk: RiskLevelCount;
  open_alerts: number;
}

export async function runFraudAnalysis(
  idToken: string
): Promise<{ success: boolean; message: string; analyzed: number }> {
  return request<{ success: boolean; message: string; analyzed: number }>(
    "/api/v1/fraud/analyze",
    { method: "POST" },
    idToken
  );
}

export async function getFraudAlerts(
  idToken: string,
  riskLevel?: string,
  limit: number = 50,
  offset: number = 0
): Promise<FraudAlertListResponse> {
  let url = `/api/v1/fraud/alerts?limit=${limit}&offset=${offset}`;
  if (riskLevel) {
    url += `&risk_level=${riskLevel}`;
  }
  return request<FraudAlertListResponse>(url, {}, idToken);
}

export async function getFraudSummary(
  idToken: string
): Promise<FraudSummaryResponse> {
  return request<FraudSummaryResponse>("/api/v1/fraud/summary", {}, idToken);
}

// ============================================================================
// FT-03 ALTERNATIVE CREDIT ASSESSMENT & FINANCIAL TRUST SCORE (PART 05)
// ============================================================================

export interface CreditComponentScores {
  financial_stability: number;
  cash_flow_health: number;
  revenue_consistency: number;
  expense_discipline: number;
  repayment_capacity: number;
  transaction_behavior: number;
  fraud_risk: number;
}

export interface CreditFactor {
  name: string;
  description: string;
  metric_name: string;
  metric_value: string;
  impact: "positive" | "negative";
}

export interface CreditMetrics {
  avg_monthly_revenue: number;
  avg_monthly_expense: number;
  net_cash_flow: number;
  expense_ratio: number;
  revenue_std: number;
  cash_flow_volatility: number;
  transaction_frequency: number;
  avg_transaction_value: number;
  revenue_consistency: number;
  fraud_alert_rate: number;
  repayment_capacity: number;
  positive_cash_flow_months_ratio: number;
  active_months: number;
  total_transactions: number;
  business_age_years: number;
  annual_turnover: number;
}

export interface CreditProfileResponse {
  id: string;
  business_id: string;
  trust_score: number;
  components: CreditComponentScores;
  positive_factors: string[];
  negative_factors: string[];
  detailed_factors: CreditFactor[];
  metrics: CreditMetrics;
  disclaimer: string;
  created_at: string;
}

export async function assessCredit(
  idToken: string,
  recalculateFraud: boolean = false
): Promise<CreditProfileResponse> {
  return request<CreditProfileResponse>(
    "/api/v1/credit/assess",
    {
      method: "POST",
      body: JSON.stringify({ recalculate_fraud: recalculateFraud }),
    },
    idToken
  );
}

export async function getCreditProfile(
  idToken: string
): Promise<CreditProfileResponse> {
  return request<CreditProfileResponse>(
    "/api/v1/credit/profile",
    { method: "GET" },
    idToken
  );
}
