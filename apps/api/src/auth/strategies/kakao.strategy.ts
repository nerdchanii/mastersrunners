import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-kakao";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>("KAKAO_CLIENT_ID"),
      clientSecret: config.get<string>("KAKAO_CLIENT_SECRET") || "",
      callbackURL: config.getOrThrow<string>("KAKAO_CALLBACK_URL"),
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      provider: "kakao" as const,
      providerAccountId: String(profile.id),
      email: profile._json?.kakao_account?.email || null,
      name:
        profile.displayName ||
        profile._json?.properties?.nickname ||
        "\uC0AC\uC6A9\uC790",
      profileImage: profile._json?.properties?.profile_image || null,
      accessToken,
      refreshToken,
    };
  }
}
