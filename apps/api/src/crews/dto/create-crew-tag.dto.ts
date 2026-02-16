import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";

export class CreateCrewTagDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
