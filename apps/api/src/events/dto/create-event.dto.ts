import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsIn, IsPositive, ValidateIf, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";

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
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(["MARATHON", "HALF", "TEN_K", "FIVE_K", "ULTRA", "TRAIL", "OTHER"])
  eventType?: string;

  @IsDateString()
  eventDate!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxParticipants?: number;

  @IsOptional()
  @IsDateString()
  registrationStart?: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.registrationStart !== undefined)
  @Validate(IsAfterRegistrationStart)
  registrationEnd?: string;
}
