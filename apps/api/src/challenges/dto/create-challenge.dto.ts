import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString, IsIn, IsPositive, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

@ValidatorConstraint({ name: "isAfterStartDate", async: false })
class IsAfterStartDate implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const obj = args.object as CreateChallengeDto;
    if (!obj.startDate || !value) return true;
    return new Date(value) > new Date(obj.startDate);
  }

  defaultMessage() {
    return "종료일은 시작일 이후여야 합니다.";
  }
}

export class CreateChallengeDto {
  @ApiProperty({ description: '챌린지 제목', example: '2월 100km 달리기' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: '챌린지 설명', example: '2월 한 달 동안 100km를 완주하는 챌린지', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '챌린지 유형', example: 'DISTANCE', enum: ['DISTANCE', 'FREQUENCY', 'STREAK', 'PACE'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(["DISTANCE", "FREQUENCY", "STREAK", "PACE"])
  type!: string;

  @ApiProperty({ description: '목표 값', example: 100 })
  @IsNumber()
  @IsPositive()
  targetValue!: number;

  @ApiProperty({ description: '목표 단위', example: 'KM', enum: ['KM', 'COUNT', 'DAYS', 'SEC_PER_KM'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(["KM", "COUNT", "DAYS", "SEC_PER_KM"])
  targetUnit!: string;

  @ApiProperty({ description: '시작일', example: '2025-02-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: '종료일', example: '2025-02-28T23:59:59Z' })
  @IsDateString()
  @Validate(IsAfterStartDate)
  endDate!: string;

  @ApiProperty({ description: '크루 ID (크루 전용 챌린지)', example: 'clx123', required: false })
  @IsOptional()
  @IsString()
  crewId?: string;

  @ApiProperty({ description: '공개 여부', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '이미지 URL', example: 'https://r2.example.com/challenge.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
