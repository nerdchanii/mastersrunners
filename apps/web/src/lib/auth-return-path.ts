const AUTH_RETURN_PATH_KEY = "auth:return-path";

function isSafeInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export function sanitizeAuthReturnPath(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  const trimmedPath = path.trim();
  if (!trimmedPath || !isSafeInternalPath(trimmedPath)) {
    return null;
  }

  if (trimmedPath === "/login" || trimmedPath.startsWith("/auth")) {
    return null;
  }

  return trimmedPath;
}

export function rememberAuthReturnPath(path: string | null | undefined) {
  const safePath = sanitizeAuthReturnPath(path);

  if (typeof window === "undefined") {
    return safePath;
  }

  if (!safePath) {
    window.sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
    return null;
  }

  window.sessionStorage.setItem(AUTH_RETURN_PATH_KEY, safePath);
  return safePath;
}

export function consumeAuthReturnPath() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedPath = window.sessionStorage.getItem(AUTH_RETURN_PATH_KEY);
  window.sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
  return sanitizeAuthReturnPath(storedPath);
}
