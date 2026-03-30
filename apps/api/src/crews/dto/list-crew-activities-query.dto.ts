import { IsOptional, IsString } from "class-validator";

import { CursorLimitQueryDto } from "../../common/dto/cursor-limit-query.dto.js";

export class ListCrewActivitiesQueryDto extends CursorLimitQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
