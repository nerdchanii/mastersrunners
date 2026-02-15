import { IsString, IsOptional, IsArray, MaxLength, IsIn, ArrayMaxSize } from "class-validator";

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsIn(["PRIVATE", "FOLLOWERS", "PUBLIC"])
  visibility?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  hashtags?: string[];
}
