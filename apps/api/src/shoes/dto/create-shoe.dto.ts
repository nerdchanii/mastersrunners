import { IsString, IsOptional, IsNumber, MaxLength, Min } from "class-validator";

export class CreateShoeDto {
  @IsString()
  @MaxLength(50)
  brand!: string;

  @IsString()
  @MaxLength(100)
  model!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDistance?: number;
}
