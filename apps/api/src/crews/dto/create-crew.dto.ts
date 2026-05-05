import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateCrewDto {
  @ApiProperty({ description: "크루 이름", example: "서울 러닝 크루", minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    description: "크루 설명",
    example: "서울에서 활동하는 러닝 크루입니다",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: "크루 이미지 URL",
    example: "https://r2.example.com/crew.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiProperty({
    description: "크루 프로필 이미지 URL",
    example: "https://r2.example.com/crew-profile.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string | null;

  @ApiProperty({
    description: "크루 커버 이미지 URL",
    example: "https://r2.example.com/crew-cover.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @ApiProperty({ description: "공개 여부", example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: "최대 멤버 수", example: 50, minimum: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(2)
  maxMembers?: number;

  @ApiProperty({ description: "크루 활동 지역 (상세)", example: "강남구", required: false })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiProperty({ description: "광역시/도", example: "서울특별시", required: false })
  @IsOptional()
  @IsString()
  region?: string | null;

  @ApiProperty({ description: "시/군/구", example: "강남구", required: false })
  @IsOptional()
  @IsString()
  subRegion?: string | null;
}
