import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

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

  const port = config.get<number>("API_PORT", 4000);
  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
}
bootstrap();
