import { Module } from "@nestjs/common";

import { FeedbackOpsGuard } from "./guards/feedback-ops.guard.js";
import { FeedbackOpsAuthService } from "./ops-auth/feedback-ops-auth.service.js";
import { FeedbackRepository } from "./repositories/feedback.repository.js";
import { FeedbackController } from "./feedback.controller.js";
import { FeedbackService } from "./feedback.service.js";
import { FeedbackOpsController } from "./feedback-ops.controller.js";

@Module({
  controllers: [FeedbackController, FeedbackOpsController],
  providers: [FeedbackService, FeedbackRepository, FeedbackOpsAuthService, FeedbackOpsGuard],
})
export class FeedbackModule {}
