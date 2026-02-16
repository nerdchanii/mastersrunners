import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString, IsIn, IsPositive, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";

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
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["DISTANCE", "FREQUENCY", "STREAK", "PACE"])
  type!: string;

  @IsNumber()
  @IsPositive()
  targetValue!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(["KM", "COUNT", "DAYS", "SEC_PER_KM"])
  targetUnit!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @Validate(IsAfterStartDate)
  endDate!: string;

  @IsOptional()
  @IsString()
  crewId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
