/**
 * FINBRIDGE — API Client
 * Typed fetch wrapper for the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field?: string; message: string }[];
}

export interface HealthResponse {
  status: string;
  service: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok && response.status !== 422) {
    const errorBody = await response.json().catch(() => ({}));
    return {
      success: false,
      message: errorBody.message ?? `HTTP ${response.status}`,
      errors: errorBody.errors,
    };
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

// ─────────────────────────────────────────────
// Generic helpers — to be expanded per module
// ─────────────────────────────────────────────

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "GET", ...init }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...init,
    }),
};
