import { IsNumber, IsString, IsBoolean, IsOptional, IsDateString, Min, Max, MaxLength } from "class-validator";

export class CreateWorkoutDto {
  @IsNumber()
  @Min(1)
  @Max(500000)
  distance!: number;

  @IsNumber()
  @Min(1)
  @Max(86400)
  duration!: number;

  @IsDateString()
  date!: string;

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
