import "./config/load-env.js";
import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

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

  app.useBodyParser("json", { limit: "50mb" });
  app.useBodyParser("urlencoded", { extended: true, limit: "50mb" });
  app.useBodyParser("raw", {
    type: ["application/octet-stream", "image/*", "application/gpx+xml"],
    limit: "50mb",
  });

  const frontendUrl = config.get<string>("FRONTEND_URL", "http://localhost:3000");
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (e.g., mobile, curl, Playwright)
      if (!origin) return callback(null, true);
      // In development, allow any localhost port
      if (process.env.NODE_ENV === "development" && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      if (origin === frontendUrl) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix("api/v1", {
    exclude: ["health"],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Masters Runners API")
    .setDescription("러닝 커뮤니티 API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app as any, swaggerConfig);
  SwaggerModule.setup("api-docs", app as any, document);

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
