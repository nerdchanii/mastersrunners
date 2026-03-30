import { IsOptional, IsString } from "class-validator";

import { LimitQueryDto } from "./limit-query.dto.js";

export class CursorLimitQueryDto extends LimitQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}
