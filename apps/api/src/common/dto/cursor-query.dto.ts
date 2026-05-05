import { IsOptional, IsString } from "class-validator";

export class CursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}
