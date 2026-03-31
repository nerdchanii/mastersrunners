import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-naver-v2";

interface NaverAuthProfile {
  accessToken: string;
  email: string | null;
  name: string;
  profileImage: string | null;
  provider: "naver";
  providerAccountId: string;
  refreshToken: string;
}

const NaverStrategyBase: new (...args: any[]) => Strategy = PassportStrategy(Strategy, "naver");

@Injectable()
export class NaverStrategy extends NaverStrategyBase {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>("NAVER_CLIENT_ID"),
      clientSecret: config.getOrThrow<string>("NAVER_CLIENT_SECRET"),
      callbackURL: config.getOrThrow<string>("NAVER_CALLBACK_URL"),
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile): NaverAuthProfile {
    return {
      provider: "naver" as const,
      providerAccountId: profile.id,
      email: profile.email || null,
      name: profile.nickname || profile.name || "사용자",
      profileImage: profile.profileImage || null,
      accessToken,
      refreshToken,
    };
  }
}
