import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DatabaseService } from "../../database/database.service.js";

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService,
    private readonly db: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedException("탈퇴한 계정입니다.");
    }

    return { userId: payload.sub, email: payload.email };
  }
}
