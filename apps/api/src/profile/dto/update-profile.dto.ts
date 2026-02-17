import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  backgroundImage?: string;
}
