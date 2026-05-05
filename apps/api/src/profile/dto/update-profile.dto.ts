import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subRegion?: string | null;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  profileImage?: string | null;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  backgroundImage?: string | null;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(["PRIVATE", "FOLLOWERS", "PUBLIC"])
  workoutSharingDefault?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pb5kSeconds?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  pb10kSeconds?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  pbHalfMarathonSeconds?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  pbMarathonSeconds?: number | null;
}
