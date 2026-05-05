import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

import { CursorLimitQueryDto } from "../../common/dto/cursor-limit-query.dto.js";
import { toOptionalBoolean } from "../../common/dto/query-transformers.js";

export class ListChallengesQueryDto extends CursorLimitQueryDto {
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  crewId?: string;
}
