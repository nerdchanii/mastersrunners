import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCrewTagDto {
  @ApiProperty({ description: '태그 이름', example: '코어멤버', minLength: 1, maxLength: 30 })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  name!: string;

  @ApiProperty({ description: '태그 색상 (HEX)', example: '#FF5733', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
