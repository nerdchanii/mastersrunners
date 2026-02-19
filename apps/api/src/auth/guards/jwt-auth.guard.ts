import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator.js";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // Public 라우트에서도 토큰이 있으면 파싱 시도 (req.user 채워줌)
      // 토큰이 없거나 유효하지 않으면 에러 없이 통과
      return super.canActivate(context);
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Public 라우트에서는 인증 실패해도 통과 (user가 null이면 그냥 null 반환)
    if (isPublic) {
      return user || null;
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
