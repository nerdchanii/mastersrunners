import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateBoardPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;
}
