import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { CreateFeedbackSubmissionDto } from "./dto/create-feedback-submission.dto.js";
import { FeedbackService } from "./feedback.service.js";

@ApiTags("Feedback")
@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateFeedbackSubmissionDto) {
    const { userId } = req.user as { userId: string };
    const userAgent = req.get("user-agent");
    return this.feedbackService.create(userId, dto, userAgent);
  }
}
