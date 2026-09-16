/**
 * FINBRIDGE — Typed API Client (Part 02)
 * Extends Part 01 with authenticated requests and auth endpoints.
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
