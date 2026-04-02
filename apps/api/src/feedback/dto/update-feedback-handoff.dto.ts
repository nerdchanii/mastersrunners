import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

import {
  FEEDBACK_HANDOFF_REFERENCE_KINDS,
  type FeedbackHandoffReferenceKind,
} from "../types/feedback.constants.js";

export class FeedbackFollowUpReferenceDto {
  @ApiProperty({
    description: "후속 작업 참조 종류",
    enum: FEEDBACK_HANDOFF_REFERENCE_KINDS,
    example: "TASK",
  })
  @IsString()
  @IsIn(FEEDBACK_HANDOFF_REFERENCE_KINDS)
  kind!: FeedbackHandoffReferenceKind;

  @ApiProperty({
    description: "표시 라벨",
    example: "I-0014-260",
  })
  @IsString()
  @MaxLength(120)
  label!: string;

  @ApiProperty({
    description: "후속 작업 식별자 또는 링크",
    example: "tasks/archive/I-0014-260-web-feedback-ops-inbox-and-triage.md",
  })
  @IsString()
  @MaxLength(500)
  target!: string;
}

export class UpdateFeedbackHandoffDto {
  @ApiPropertyOptional({
    description: "운영자 handoff 메모",
    example: "triage 후 UI 안정화 체인으로 연결",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  handoffNote?: string;

  @ApiProperty({
    description: "후속 작업 레퍼런스 목록",
    type: [FeedbackFollowUpReferenceDto],
  })
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => FeedbackFollowUpReferenceDto)
  references!: FeedbackFollowUpReferenceDto[];
}
