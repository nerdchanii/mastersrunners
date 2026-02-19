import { IsString, IsOptional, IsBoolean, IsIn, MinLength, MaxLength, IsUrl } from "class-validator";

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
  @IsUrl({ require_tld: false })
  profileImage?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  backgroundImage?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(["PRIVATE", "FOLLOWERS", "PUBLIC"])
  workoutSharingDefault?: string;
}
