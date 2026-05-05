const LOCAL_API_BASE = "http://localhost:4000/api/v1";

function resolveApiBase() {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return LOCAL_API_BASE;
  }

  return "/api/v1";
}

const API_BASE = resolveApiBase();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

class ApiClient {
  private async request<T = unknown>(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new ApiError(
        typeof body?.message === "string" ? body.message : `HTTP ${response.status}`,
        response.status,
        body,
      );
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  get<T = unknown>(path: string) {
    return this.request<T>(path);
  }

  patch<T = unknown>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  put<T = unknown>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient();
