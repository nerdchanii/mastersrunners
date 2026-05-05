import "../config/load-env.js";

import { Module, type Provider } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { isOAuthProviderEnabled } from "../config/feature-flags.js";
import { DatabaseModule } from "../database/database.module.js";

import { JwtSseGuard } from "./guards/jwt-sse.guard.js";
import { AccountRepository } from "./repositories/account.repository.js";
import { UserRepository } from "./repositories/user.repository.js";
import { GoogleStrategy } from "./strategies/google.strategy.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { KakaoStrategy } from "./strategies/kakao.strategy.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { resolveJwtExpiresIn } from "./jwt-ttl.js";

// Only register OAuth strategies when credentials are configured.
// load-env preloads repo-supported env files before this module evaluates.
const oauthStrategies: Provider[] = [];
if (isOAuthProviderEnabled("kakao")) oauthStrategies.push(KakaoStrategy);
if (isOAuthProviderEnabled("google")) oauthStrategies.push(GoogleStrategy);

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
          expiresIn: resolveJwtExpiresIn(config.get<string>("JWT_ACCESS_TTL"), 900),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtSseGuard,
    ...oauthStrategies,
    UserRepository,
    AccountRepository,
  ],
  exports: [AuthService, UserRepository, JwtModule, JwtSseGuard],
})
export class AuthModule {}
