import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import { FEEDBACK_CATEGORIES } from "../types/feedback.constants.js";

export class CreateFeedbackSubmissionDto {
  @ApiProperty({
    description: "피드백 분류",
    enum: FEEDBACK_CATEGORIES,
    example: "BUG",
  })
  @IsString()
  @IsIn(FEEDBACK_CATEGORIES)
  category!: string;

  @ApiProperty({
    description: "요약 제목",
    example: "게시글 상세에서 이미지가 보이지 않아요",
  })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty({
    description: "상세 설명",
    example: "피드에서는 보이는데 상세로 들어가면 이미지가 사라집니다.",
  })
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({
    description: "문제가 발생한 경로",
    example: "/posts/post-1",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  currentPath?: string;
}
