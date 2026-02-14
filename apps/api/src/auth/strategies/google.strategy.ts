import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: config.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: config.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      provider: "google" as const,
      providerAccountId: profile.id,
      email: profile.emails?.[0]?.value || null,
      name: profile.displayName || "\uC0AC\uC6A9\uC790",
      profileImage: profile.photos?.[0]?.value || null,
      accessToken,
      refreshToken,
    };
  }
}
