import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateCrewTagDto {
  @ApiProperty({ description: "태그 이름", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  name?: string;

  @ApiProperty({ description: "태그 색상 (HEX)", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
