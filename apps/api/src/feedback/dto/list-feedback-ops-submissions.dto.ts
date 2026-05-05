import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import { FEEDBACK_CATEGORIES, FEEDBACK_TRIAGE_STATUSES } from "../types/feedback.constants.js";

export class ListFeedbackOpsSubmissionsDto {
  @ApiPropertyOptional({
    description: "상태 필터",
    enum: FEEDBACK_TRIAGE_STATUSES,
  })
  @IsOptional()
  @IsString()
  @IsIn(FEEDBACK_TRIAGE_STATUSES)
  status?: string;

  @ApiPropertyOptional({
    description: "카테고리 필터",
    enum: FEEDBACK_CATEGORIES,
  })
  @IsOptional()
  @IsString()
  @IsIn(FEEDBACK_CATEGORIES)
  category?: string;

  @ApiPropertyOptional({
    description: "제목과 설명 검색어",
    example: "이미지",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
