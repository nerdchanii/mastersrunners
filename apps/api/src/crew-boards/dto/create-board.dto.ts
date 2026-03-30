import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  writePermission?: string;
}
