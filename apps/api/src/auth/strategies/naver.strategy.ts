import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-naver-v2";

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, "naver") {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>("NAVER_CLIENT_ID"),
      clientSecret: config.getOrThrow<string>("NAVER_CLIENT_SECRET"),
      callbackURL: config.getOrThrow<string>("NAVER_CALLBACK_URL"),
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      provider: "naver" as const,
      providerAccountId: profile.id,
      email: profile.email || null,
      name: profile.nickname || profile.name || "\uC0AC\uC6A9\uC790",
      profileImage: profile.profileImage || null,
      accessToken,
      refreshToken,
    };
  }
}
