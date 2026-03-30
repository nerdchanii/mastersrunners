import { IsOptional, IsString } from "class-validator";

export class CrewAttendanceStatsQueryDto {
  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
