import { randomUUID } from "node:crypto";

import { CallHandler, ExecutionContext, Injectable, type NestInterceptor } from "@nestjs/common";
import type { Request, Response } from "express";
import { finalize, Observable } from "rxjs";

import { StructuredLoggerService } from "./structured-logger.service.js";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const requestId = (request.header("x-request-id") || randomUUID()).toString();

    response.setHeader("x-request-id", requestId);

    return next.handle().pipe(
      finalize(() => {
        this.logger.logEvent("log", "http_request_completed", "HttpRequest", {
          requestId,
          method: request.method,
          path: request.originalUrl || request.url,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
          userId: (request.user as { userId?: string } | undefined)?.userId ?? null,
        });
      }),
    );
  }
}
