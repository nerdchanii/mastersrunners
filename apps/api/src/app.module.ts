import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 30 }],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
