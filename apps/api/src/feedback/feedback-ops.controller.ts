import { Body, Controller, Get, Param, Patch, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "../common/decorators/public.decorator.js";

import { ListFeedbackOpsSubmissionsDto } from "./dto/list-feedback-ops-submissions.dto.js";
import { UpdateFeedbackHandoffDto } from "./dto/update-feedback-handoff.dto.js";
import { UpdateFeedbackTriageDto } from "./dto/update-feedback-triage.dto.js";
import { FeedbackOpsGuard } from "./guards/feedback-ops.guard.js";
import type { FeedbackOpsRequest } from "./types/feedback-ops-request.js";
import { FeedbackService } from "./feedback.service.js";

@ApiTags("Feedback Ops")
@Public()
@UseGuards(FeedbackOpsGuard)
@Controller("feedback/ops")
export class FeedbackOpsController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get("submissions")
  listSubmissions(@Query() query: ListFeedbackOpsSubmissionsDto) {
    return this.feedbackService.listOpsSubmissions(query);
  }

  @Get("submissions/:submissionId")
  getSubmission(@Param("submissionId") submissionId: string) {
    return this.feedbackService.getOpsSubmission(submissionId);
  }

  @Patch("submissions/:submissionId/triage")
  updateTriage(
    @Param("submissionId") submissionId: string,
    @Req() req: FeedbackOpsRequest,
    @Body() dto: UpdateFeedbackTriageDto,
  ) {
    return this.feedbackService.updateTriage(submissionId, req.operator.email, dto);
  }

  @Put("submissions/:submissionId/handoff")
  replaceHandoff(
    @Param("submissionId") submissionId: string,
    @Req() req: FeedbackOpsRequest,
    @Body() dto: UpdateFeedbackHandoffDto,
  ) {
    return this.feedbackService.replaceHandoff(submissionId, req.operator.email, dto);
  }
}
