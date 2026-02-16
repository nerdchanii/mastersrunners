import { IsString, IsOptional, IsBoolean, IsInt, MinLength, MaxLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCrewDto {
  @ApiProperty({ description: '크루 이름', example: '서울 러닝 크루', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiProperty({ description: '크루 설명', example: '서울에서 활동하는 러닝 크루입니다', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '크루 이미지 URL', example: 'https://r2.example.com/crew.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: '공개 여부', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '최대 멤버 수', example: 50, minimum: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(2)
  maxMembers?: number;
}
