import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class UpdateCrewDto {
  @ApiProperty({ description: "크루 이름", example: "서울 러닝 크루", required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: "크루 설명", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: "크루 이미지 URL", required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiProperty({ description: "크루 프로필 이미지 URL", required: false })
  @IsOptional()
  @IsString()
  profileImageUrl?: string | null;

  @ApiProperty({ description: "크루 커버 이미지 URL", required: false })
  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @ApiProperty({ description: "공개 여부", required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: "최대 멤버 수", required: false })
  @IsOptional()
  @IsInt()
  @Min(2)
  maxMembers?: number;

  @ApiProperty({ description: "크루 활동 지역 (상세)", required: false })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiProperty({ description: "광역시/도", required: false })
  @IsOptional()
  @IsString()
  region?: string | null;

  @ApiProperty({ description: "시/군/구", required: false })
  @IsOptional()
  @IsString()
  subRegion?: string | null;
}
