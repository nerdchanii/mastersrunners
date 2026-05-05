import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCrewPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  visibility?: string;
}
