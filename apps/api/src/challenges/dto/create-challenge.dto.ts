import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString, IsIn } from "class-validator";

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["DISTANCE", "FREQUENCY", "STREAK", "PACE"])
  type!: string;

  @IsNumber()
  targetValue!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(["KM", "COUNT", "DAYS", "SEC_PER_KM"])
  targetUnit!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  crewId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
