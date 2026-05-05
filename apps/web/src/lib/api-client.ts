const LOCAL_API_BASE = "http://localhost:4000/api/v1";

function resolveApiBase() {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return LOCAL_API_BASE;
  }

  throw new Error("VITE_API_URL must be set for non-development web builds.");
}

const API_BASE = resolveApiBase();

interface RequestBehavior {
  allowSessionRefresh?: boolean;
  redirectOnUnauthorized?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

class ApiClient {
  private redirectToLogin() {
    if (typeof window === "undefined") return;
    const { pathname, search, hash } = window.location;
    if (pathname === "/login" || pathname.startsWith("/auth")) return;

    const next = `${pathname}${search}${hash}`;
    const loginUrl = new URL("/login", window.location.origin);
    loginUrl.searchParams.set("next", next);
    window.location.href = loginUrl.toString();
  }

  private notifyLogout() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:logout"));
    }
  }

  private async performRequest(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);

    if (
      !headers.has("Content-Type") &&
      options.body &&
      typeof FormData !== "undefined" &&
      !(options.body instanceof FormData)
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Content-Type") && options.body && typeof FormData === "undefined") {
      headers.set("Content-Type", "application/json");
    }

    return fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });
  }

  private async refreshSession(): Promise<boolean> {
    try {
      const res = await this.performRequest(`${API_BASE}/auth/refresh`, {
        method: "POST",
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async logout() {
    try {
      await this.performRequest(`${API_BASE}/auth/logout`, {
        method: "POST",
      });
    } catch {
      // Ignore logout transport failures and still clear local auth state.
    } finally {
      this.notifyLogout();
    }
  }

  private async request<T = unknown>(
    path: string,
    options: RequestInit = {},
    behavior: RequestBehavior = {},
  ): Promise<T> {
    const url = `${API_BASE}${path}`;
    let res = await this.performRequest(url, options);

    if (res.status === 401 && behavior.allowSessionRefresh !== false) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        res = await this.performRequest(url, options);
      } else {
        await this.logout();
        if (behavior.redirectOnUnauthorized !== false) {
          this.redirectToLogin();
        }
        throw new ApiError("세션이 만료되었습니다", 401);
      }
    }

    if (res.status === 401) {
      if (behavior.redirectOnUnauthorized !== false) {
        await this.logout();
        this.redirectToLogin();
      }
      throw new ApiError("로그인이 필요합니다", 401);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Request failed" }));
      throw new ApiError(body.message || `HTTP ${res.status}`, res.status, body);
    }

    // Handle empty responses (204 No Content, etc.)
    const text = await res.text();
    if (!text) return undefined as T;

    return JSON.parse(text);
  }

  async fetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, options, {
      allowSessionRefresh: true,
      redirectOnUnauthorized: true,
    });
  }

  async fetchSession<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, options, {
      allowSessionRefresh: true,
      redirectOnUnauthorized: false,
    });
  }
}

export const api = new ApiClient();
export { API_BASE };
