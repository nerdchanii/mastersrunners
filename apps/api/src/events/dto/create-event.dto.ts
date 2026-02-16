import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsIn, IsPositive, ValidateIf, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

@ValidatorConstraint({ name: "isAfterRegistrationStart", async: false })
class IsAfterRegistrationStart implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const obj = args.object as CreateEventDto;
    if (!obj.registrationStart || !value) return true;
    return new Date(value) > new Date(obj.registrationStart);
  }

  defaultMessage() {
    return "등록 마감일은 등록 시작일 이후여야 합니다.";
  }
}

export class CreateEventDto {
  @ApiProperty({ description: '이벤트 제목', example: '서울 마라톤 2025' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: '이벤트 설명', example: '서울시 주최 마라톤 대회', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '이벤트 유형', example: 'MARATHON', enum: ['MARATHON', 'HALF', 'TEN_K', 'FIVE_K', 'ULTRA', 'TRAIL', 'OTHER'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(["MARATHON", "HALF", "TEN_K", "FIVE_K", "ULTRA", "TRAIL", "OTHER"])
  eventType?: string;

  @ApiProperty({ description: '이벤트 일시', example: '2025-03-15T08:00:00Z' })
  @IsDateString()
  eventDate!: string;

  @ApiProperty({ description: '장소', example: '서울 올림픽공원', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '위도', example: 37.5207, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: '경도', example: 127.1240, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: '이미지 URL', example: 'https://r2.example.com/event.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: '최대 참가자 수', example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxParticipants?: number;

  @ApiProperty({ description: '등록 시작일', example: '2025-02-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  registrationStart?: string;

  @ApiProperty({ description: '등록 마감일', example: '2025-03-10T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.registrationStart !== undefined)
  @Validate(IsAfterRegistrationStart)
  registrationEnd?: string;
}
