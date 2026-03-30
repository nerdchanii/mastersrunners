import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SubmitEventResultDto {
  @IsInt()
  resultTime!: number;

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
