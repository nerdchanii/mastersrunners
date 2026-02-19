import { IsString, IsOptional, IsNumber, IsDateString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCrewActivityDto {
  @ApiProperty({ description: '활동 제목', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: '활동 설명', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '활동 일시', required: false })
  @IsOptional()
  @IsDateString()
  activityDate?: string;

  @ApiProperty({ description: '장소', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ description: '위도', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: '경도', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: '활동 타입', example: 'OFFICIAL', required: false })
  @IsOptional()
  @IsString()
  activityType?: string; // OFFICIAL | POP_UP

  @ApiProperty({ description: '워크아웃 타입 ID', required: false })
  @IsOptional()
  @IsString()
  workoutTypeId?: string;
}
