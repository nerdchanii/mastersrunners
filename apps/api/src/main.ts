import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });
  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
}
bootstrap();
