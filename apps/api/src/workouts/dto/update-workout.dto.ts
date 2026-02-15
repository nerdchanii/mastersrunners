import { IsNumber, IsString, IsBoolean, IsOptional, IsDateString, Min, Max, MaxLength } from "class-validator";

export class UpdateWorkoutDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500000)
  distance?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(86400)
  duration?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  workoutTypeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  memo?: string;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  shoeId?: string;
}
