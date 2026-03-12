import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { StructuredLoggerService } from "../logging/structured-logger.service.js";

@Injectable()
export class MonitoringService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: StructuredLoggerService,
  ) {}

  isEnabled(): boolean {
    return (
      this.config.get<string>("MONITORING_ENABLED", "false") === "true" &&
      Boolean(this.config.get<string>("MONITORING_DSN"))
    );
  }

  captureException(error: unknown, context: Record<string, unknown> = {}) {
    if (!this.isEnabled()) {
      return;
    }

    this.logger.logEvent("warn", "monitoring_capture_stub", "MonitoringService", {
      ...context,
      monitoringEnabled: true,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
    });
  }
}
