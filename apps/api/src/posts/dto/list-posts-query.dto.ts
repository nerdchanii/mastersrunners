import { IsOptional, IsString } from "class-validator";

import { CursorLimitQueryDto } from "../../common/dto/cursor-limit-query.dto.js";

export class ListPostsQueryDto extends CursorLimitQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
