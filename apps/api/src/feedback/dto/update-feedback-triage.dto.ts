import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import {
  FEEDBACK_TRIAGE_STATUSES,
  type FeedbackTriageStatus,
} from "../types/feedback.constants.js";

export class UpdateFeedbackTriageDto {
  @ApiProperty({
    description: "피드백 triage 상태",
    enum: FEEDBACK_TRIAGE_STATUSES,
    example: "IN_REVIEW",
  })
  @IsString()
  @IsIn(FEEDBACK_TRIAGE_STATUSES)
  status!: FeedbackTriageStatus;

  @ApiPropertyOptional({
    description: "운영자 triage 메모",
    example: "재현 확인 후 첨부 업로드 흐름 정리 필요",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  triageNote?: string;
}
