import { IsString, IsOptional, IsArray, MaxLength, IsIn, ArrayMaxSize, IsUrl } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({ description: '게시글 내용', example: '오늘 5km 완주했습니다!', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiProperty({ description: '공개 범위', example: 'PUBLIC', enum: ['PRIVATE', 'FOLLOWERS', 'PUBLIC'], required: false })
  @IsOptional()
  @IsIn(["PRIVATE", "FOLLOWERS", "PUBLIC"])
  visibility?: string;

  @ApiProperty({ description: '해시태그 목록', example: ['러닝', '5km'], required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  hashtags?: string[];

  @ApiProperty({ description: '첨부할 워크아웃 ID 목록', example: ['clx123', 'clx456'], required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workoutIds?: string[];

  @ApiProperty({ description: '이미지 URL 목록', example: ['https://r2.example.com/image1.jpg'], required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  imageUrls?: string[];
}
