import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsIn } from "class-validator";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(["MARATHON", "HALF", "TEN_K", "FIVE_K", "ULTRA", "TRAIL", "OTHER"])
  eventType?: string;

  @IsDateString()
  eventDate!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}
