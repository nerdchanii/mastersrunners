import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { FeedbackOpsAuthService } from "../ops-auth/feedback-ops-auth.service.js";
import { FeedbackRepository } from "../repositories/feedback.repository.js";
import type { FeedbackOpsRequest } from "../types/feedback-ops-request.js";

@Injectable()
export class FeedbackOpsGuard implements CanActivate {
  constructor(
    private readonly feedbackOpsAuthService: FeedbackOpsAuthService,
    private readonly feedbackRepository: FeedbackRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FeedbackOpsRequest>();
    const assertion = request.get("cf-access-jwt-assertion")?.trim();

    if (!assertion) {
      throw new UnauthorizedException("운영자 Access 인증이 필요합니다.");
    }

    const operator = await this.feedbackOpsAuthService.verifyAssertion(assertion);
    const identity = await this.feedbackRepository.findActiveOperatorIdentity(operator.email);

    if (!identity) {
      throw new ForbiddenException("운영자 권한이 없습니다.");
    }

    request.operator = {
      email: identity.email,
      note: identity.note,
    };

    return true;
  }
}
