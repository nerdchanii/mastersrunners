import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength, Min } from "class-validator";

export class UpdateShoeDto {
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

  @IsOptional()
  @IsBoolean()
  isRetired?: boolean;
}
