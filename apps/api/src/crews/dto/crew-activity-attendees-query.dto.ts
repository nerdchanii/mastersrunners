import { IsOptional, IsString } from "class-validator";

export class CrewActivityAttendeesQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
