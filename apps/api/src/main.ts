import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import express from "express";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.raw({ type: ["application/octet-stream", "image/*", "application/gpx+xml"], limit: "50mb" }));

  app.enableCors({
    origin: config.get<string>("FRONTEND_URL", "http://localhost:3000"),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
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
  console.log(`API server running on http://localhost:${port}/api/v1`);
}
bootstrap();
