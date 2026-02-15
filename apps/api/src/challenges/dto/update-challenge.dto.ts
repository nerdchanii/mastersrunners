import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsIn } from "class-validator";

export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(["DISTANCE", "FREQUENCY", "STREAK", "PACE"])
  type?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsString()
  @IsIn(["KM", "COUNT", "DAYS", "SEC_PER_KM"])
  targetUnit?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
