import { IsString, IsOptional, IsBoolean, IsInt, MinLength, MaxLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCrewDto {
  @ApiProperty({ description: '크루 이름', example: '서울 러닝 크루', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: '크루 설명', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '크루 이미지 URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: '공개 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '최대 멤버 수', required: false })
  @IsOptional()
  @IsInt()
  @Min(2)
  maxMembers?: number;
}
