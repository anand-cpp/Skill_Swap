import type {
  CyclesResponse,
  ExchangeRequest,
  MatchesResponse,
  RequestsResponse,
  Skill,
  Student,
  StudentSummary,
} from "./types";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const DEFAULT_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: number;
  public readonly details?: unknown;
  public readonly path: string;

  constructor(message: string, status: number, path: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = status;
    this.path = path;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

let activeAuthToken: string | null = null;

export function setSessionToken(token: string | null): void {
  activeAuthToken = token;
  if (typeof window !== "undefined" && window.sessionStorage) {
    if (token) {
      window.sessionStorage.setItem("skillswap_auth_token", token);
    } else {
      window.sessionStorage.removeItem("skillswap_auth_token");
    }
  }
}

export function getSessionToken(): string | null {
  if (activeAuthToken) return activeAuthToken;
  if (typeof window !== "undefined" && window.sessionStorage) {
    activeAuthToken = window.sessionStorage.getItem("skillswap_auth_token");
  }
  return activeAuthToken;
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {}, ...rest } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  const token = getSessionToken();
  if (token && !requestHeaders["Authorization"]) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(API + path, {
      ...rest,
      headers: requestHeaders,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorPayload = await res.json().catch(() => ({}));
      const message =
        typeof errorPayload.detail === "string"
          ? errorPayload.detail
          : Array.isArray(errorPayload.detail)
            ? errorPayload.detail[0]?.msg ?? "Validation error"
            : errorPayload.error?.message ?? `Request failed with status ${res.status}`;

      throw new ApiError(message, res.status, path, errorPayload.error?.details ?? errorPayload.detail);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(`Request timeout after ${timeoutMs}ms`, 408, path);
    }
    const message = err instanceof Error ? err.message : "Network connection failed";
    throw new ApiError(message, 0, path);
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface AuthSessionResponse {
  token: string;
  token_type: string;
  student: Student;
}

export const api = {
  health: () => request<{ status: string; version?: string; database?: { connected: boolean } }>("/health"),
  authenticateSession: (studentId: number) =>
    request<AuthSessionResponse>("/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId }),
    }),
  listStudents: () => request<StudentSummary[]>("/students"),
  getStudent: (id: number) => request<Student>(`/students/${id}`),
  matches: (id: number) =>
    request<MatchesResponse>(`/students/${id}/matches`, { method: "POST" }),
  cycles: (id: number) =>
    request<CyclesResponse>(`/students/${id}/cycles`, { method: "POST" }),
  requests: (id: number) => request<RequestsResponse>(`/requests/${id}`),
  sendRequest: (senderId: number, receiverId: number, teachSkillId: number, learnSkillId: number) =>
    request<ExchangeRequest>("/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        teach_skill_id: teachSkillId,
        learn_skill_id: learnSkillId,
      }),
    }),
  decide: (id: number, action: "accept" | "reject" | "complete") =>
    request<ExchangeRequest>(`/requests/${id}/${action}`, { method: "POST" }),
  createStudent: (payload: {
    name: string;
    college: string;
    bio: string;
    skills: Array<{ name: string; category: string; direction: "teach" | "learn"; level: string }>;
  }) =>
    request<Student>("/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};

export type { Skill };
