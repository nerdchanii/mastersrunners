import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PresignUploadDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsOptional()
  @IsString()
  folder?: string;
}
