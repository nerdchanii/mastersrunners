import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

import { extractAccessTokenFromRequest } from "../auth-cookie.util.js";

@Injectable()
export class JwtSseGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractAccessToken(request);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const secret = this.configService.getOrThrow<string>("JWT_SECRET");
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Attach user to request (same format as JWT strategy)
      request.user = { userId: payload.sub, email: payload.email };

      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private extractAccessToken(request: Request): string | undefined {
    return extractAccessTokenFromRequest(request);
  }
}
