import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { createSecurityHeadersMiddleware } from "./security-headers.js";

const LOCALHOST_ORIGIN = /^http:\/\/localhost:\d+$/;
const JSON_BODY_LIMIT = "1mb";
const RAW_BODY_LIMIT = "50mb";

function resolveAllowedOrigin(
  frontendUrl: string,
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (process.env.NODE_ENV === "development" && LOCALHOST_ORIGIN.test(origin)) {
    callback(null, true);
    return;
  }

  if (origin === frontendUrl) {
    callback(null, true);
    return;
  }

  callback(new Error("Not allowed by CORS"));
}

export function configureApp(app: NestExpressApplication) {
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>("FRONTEND_URL", "http://localhost:3000");

  app.useBodyParser("json", { limit: JSON_BODY_LIMIT });
  app.useBodyParser("urlencoded", { extended: true, limit: JSON_BODY_LIMIT });
  app.useBodyParser("raw", {
    type: ["application/octet-stream", "image/*", "application/gpx+xml"],
    limit: RAW_BODY_LIMIT,
  });

  app.use(createSecurityHeadersMiddleware());

  app.enableCors({
    origin: (origin, callback) => resolveAllowedOrigin(frontendUrl, origin, callback),
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
    exclude: ["health", "api/v1/health"],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Masters Runners API")
    .setDescription("러닝 커뮤니티 API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app as any, swaggerConfig);

  SwaggerModule.setup("api-docs", app as any, document);
}
