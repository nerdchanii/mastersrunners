import "./config/load-env.js";
import "reflect-metadata";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { configureApp } from "./bootstrap/configure-app.js";
import { StructuredLoggerService } from "./common/logging/structured-logger.service.js";
import { MonitoringService } from "./common/monitoring/monitoring.service.js";
import { validateProductionRuntimeEnv } from "./config/runtime-env.js";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    rawBody: true,
    bufferLogs: true,
  });
  const config = app.get(ConfigService);
  validateProductionRuntimeEnv(config);
  const logger = app.get(StructuredLoggerService);
  const monitoring = app.get(MonitoringService);

  app.useLogger(logger);
  configureApp(app);

  const port = config.get<number>("API_PORT", 4000);
  const apiPublicUrl = config.get<string>("API_PUBLIC_URL")?.trim() || undefined;
  await app.listen(port);
  logger.logEvent("log", "api_bootstrap_complete", "Bootstrap", {
    port,
    apiPublicUrl,
    listenAddress: `http://0.0.0.0:${port}/api/v1`,
    monitoringEnabled: monitoring.isEnabled(),
  });
}
bootstrap();
