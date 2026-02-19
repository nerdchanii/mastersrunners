import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCrewActivityDto {
  @ApiProperty({ description: '활동 제목', example: '주말 한강 러닝' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({ description: '활동 설명', example: '토요일 아침 한강에서 10km 러닝', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '활동 일시', example: '2025-02-22T08:00:00Z' })
  @IsDateString()
  activityDate!: string;

  @ApiProperty({ description: '장소', example: '한강공원 뚝섬', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ description: '위도', example: 37.5326, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: '경도', example: 127.0658, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: '활동 타입', example: 'OFFICIAL', required: false })
  @IsOptional()
  @IsString()
  activityType?: string; // OFFICIAL | POP_UP, default OFFICIAL

  @ApiProperty({ description: '워크아웃 타입 ID', required: false })
  @IsOptional()
  @IsString()
  workoutTypeId?: string;
}
