import "dotenv/config";
import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express from "express";

import { StructuredLoggerService } from "./common/logging/structured-logger.service.js";
import { MonitoringService } from "./common/monitoring/monitoring.service.js";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false, bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = app.get(StructuredLoggerService);
  const monitoring = app.get(MonitoringService);

  app.useLogger(logger);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    express.raw({
      type: ["application/octet-stream", "image/*", "application/gpx+xml"],
      limit: "50mb",
    }),
  );

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
  await app.listen(port);
  logger.logEvent("log", "api_bootstrap_complete", "Bootstrap", {
    port,
    apiBaseUrl: `http://localhost:${port}/api/v1`,
    monitoringEnabled: monitoring.isEnabled(),
  });
}
bootstrap();
