import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  writePermission?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
