import type { RequestHandler } from "express";

const API_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "connect-src 'self'",
  "font-src 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "img-src 'none'",
  "object-src 'none'",
  "script-src 'none'",
  "style-src 'none'",
].join("; ");

const SWAGGER_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
].join("; ");

const API_SECURITY_HEADERS = {
  contentSecurityPolicy: "Content-Security-Policy",
  permissionsPolicy: "Permissions-Policy",
  referrerPolicy: "Referrer-Policy",
  strictTransportSecurity: "Strict-Transport-Security",
  xContentTypeOptions: "X-Content-Type-Options",
  xFrameOptions: "X-Frame-Options",
} as const;

const API_PERMISSIONS_POLICY = [
  "accelerometer=()",
  "autoplay=()",
  "camera=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

export function createSecurityHeadersMiddleware(): RequestHandler {
  return (req, res, next) => {
    const isSwaggerRoute = req.path === "/api-docs" || req.path.startsWith("/api-docs/");

    res.setHeader(API_SECURITY_HEADERS.strictTransportSecurity, "max-age=31536000");
    res.setHeader(API_SECURITY_HEADERS.xFrameOptions, "DENY");
    res.setHeader(API_SECURITY_HEADERS.xContentTypeOptions, "nosniff");
    res.setHeader(API_SECURITY_HEADERS.referrerPolicy, "strict-origin-when-cross-origin");
    res.setHeader(API_SECURITY_HEADERS.permissionsPolicy, API_PERMISSIONS_POLICY);
    res.setHeader(
      API_SECURITY_HEADERS.contentSecurityPolicy,
      isSwaggerRoute ? SWAGGER_CONTENT_SECURITY_POLICY : API_CONTENT_SECURITY_POLICY,
    );

    next();
  };
}
