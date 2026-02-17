import { Module, type Provider } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { JwtSseGuard } from "./guards/jwt-sse.guard.js";
import { KakaoStrategy } from "./strategies/kakao.strategy.js";
import { GoogleStrategy } from "./strategies/google.strategy.js";
import { NaverStrategy } from "./strategies/naver.strategy.js";
import { UserRepository } from "./repositories/user.repository.js";
import { AccountRepository } from "./repositories/account.repository.js";
import { DatabaseModule } from "../database/database.module.js";

// Only register OAuth strategies when credentials are configured.
// dotenv/config runs synchronously before module loading, so process.env is safe here.
const oauthStrategies: Provider[] = [];
if (process.env.KAKAO_CLIENT_ID) oauthStrategies.push(KakaoStrategy);
if (process.env.GOOGLE_CLIENT_ID) oauthStrategies.push(GoogleStrategy);
if (process.env.NAVER_CLIENT_ID) oauthStrategies.push(NaverStrategy);

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: Number(config.get("JWT_ACCESS_TTL", 900)),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtSseGuard, ...oauthStrategies, UserRepository, AccountRepository],
  exports: [AuthService, UserRepository, JwtModule, JwtSseGuard],
})
export class AuthModule {}
