import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";

export class SubmitEventResultDto {
  @ValidateIf(
    (dto: SubmitEventResultDto) => dto.status === "COMPLETED" || dto.resultTime !== undefined,
  )
  @IsInt()
  resultTime?: number;

  @IsOptional()
  @IsInt()
  resultRank?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bibNumber?: string;

  @IsString()
  @IsIn(["COMPLETED", "DNS", "DNF"])
  status!: "COMPLETED" | "DNS" | "DNF";
}
