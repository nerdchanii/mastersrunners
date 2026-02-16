import { IsNumber, IsString, IsBoolean, IsOptional, IsDateString, Min, Max, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkoutDto {
  @ApiProperty({ description: '거리(미터)', example: 5000, minimum: 1, maximum: 500000 })
  @IsNumber()
  @Min(1)
  @Max(500000)
  distance!: number;

  @ApiProperty({ description: '소요 시간(초)', example: 1800, minimum: 1, maximum: 86400 })
  @IsNumber()
  @Min(1)
  @Max(86400)
  duration!: number;

  @ApiProperty({ description: '운동 날짜', example: '2025-02-16T09:00:00Z' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: '제목', example: '아침 조깅', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: '워크아웃 유형 ID', example: 'clx1234567890', required: false })
  @IsOptional()
  @IsString()
  workoutTypeId?: string;

  @ApiProperty({ description: '메모', example: '날씨 좋음, 컨디션 양호', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  memo?: string;

  @ApiProperty({ description: '공개 범위', example: 'PUBLIC', enum: ['PRIVATE', 'FOLLOWERS', 'PUBLIC'], required: false })
  @IsOptional()
  @IsString()
  visibility?: string;

  @ApiProperty({ description: '신발 ID', example: 'clx9876543210', required: false })
  @IsOptional()
  @IsString()
  shoeId?: string;
}
