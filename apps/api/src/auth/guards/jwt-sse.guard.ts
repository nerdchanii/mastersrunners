import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtSseGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromQuery(request);

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const secret = this.configService.getOrThrow<string>("JWT_SECRET");
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Attach user to request (same format as JWT strategy)
      request.user = { userId: payload.sub, email: payload.email };

      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  private extractTokenFromQuery(request: Request): string | undefined {
    const token = request.query.token;
    return typeof token === "string" ? token : undefined;
  }
}
