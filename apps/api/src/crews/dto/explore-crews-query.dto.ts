import { IsOptional, IsString } from "class-validator";

import { CursorQueryDto } from "../../common/dto/cursor-query.dto.js";

export class ExploreCrewsQueryDto extends CursorQueryDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  subRegion?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
