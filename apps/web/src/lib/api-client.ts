const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

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
  private getStorage(): Storage | null {
    try {
      if (typeof window === "undefined") return null;
      const storage = window.localStorage;
      if (!storage || typeof storage.getItem !== "function") return null;
      return storage;
    } catch {
      return null;
    }
  }

  private getAccessToken(): string | null {
    return this.getStorage()?.getItem("accessToken") ?? null;
  }

  private getRefreshToken(): string | null {
    return this.getStorage()?.getItem("refreshToken") ?? null;
  }

  setTokens(accessToken: string, refreshToken: string) {
    const s = this.getStorage();
    s?.setItem("accessToken", accessToken);
    s?.setItem("refreshToken", refreshToken);
  }

  clearTokens() {
    const s = this.getStorage();
    s?.removeItem("accessToken");
    s?.removeItem("refreshToken");
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async fetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path}`;
    const headers = new Headers(options.headers);

    const token = this.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    let res = await fetch(url, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401 && token) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers.set("Authorization", `Bearer ${this.getAccessToken()}`);
        res = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed → session expired
        this.clearTokens();
        window.location.href = "/login";
        throw new ApiError("세션이 만료되었습니다", 401);
      }
    }

    // Not logged in at all → redirect to login
    if (res.status === 401 && !token) {
      window.location.href = "/login";
      throw new ApiError("로그인이 필요합니다", 401);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Request failed" }));
      throw new ApiError(
        body.message || `HTTP ${res.status}`,
        res.status,
        body,
      );
    }

    // Handle empty responses (204 No Content, etc.)
    const text = await res.text();
    if (!text) return undefined as T;

    return JSON.parse(text);
  }
}

export const api = new ApiClient();
export { API_BASE };
