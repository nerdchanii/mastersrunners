import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { FeedbackOpsAuthService } from "../ops-auth/feedback-ops-auth.service.js";
import type { FeedbackOpsRequest } from "../types/feedback-ops-request.js";

@Injectable()
export class FeedbackOpsGuard implements CanActivate {
  constructor(private readonly feedbackOpsAuthService: FeedbackOpsAuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FeedbackOpsRequest>();
    const assertion = request.get("cf-access-jwt-assertion")?.trim();

    if (!assertion) {
      throw new UnauthorizedException("운영자 Access 인증이 필요합니다.");
    }

    const operator = await this.feedbackOpsAuthService.verifyAssertion(assertion);

    request.operator = {
      email: operator.email,
      note: null,
    };

    return true;
  }
}
