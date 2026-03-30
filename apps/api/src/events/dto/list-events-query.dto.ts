import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

import { CursorLimitQueryDto } from "../../common/dto/cursor-limit-query.dto.js";
import { toOptionalBoolean } from "../../common/dto/query-transformers.js";

export class ListEventsQueryDto extends CursorLimitQueryDto {
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  upcoming?: boolean;
}
