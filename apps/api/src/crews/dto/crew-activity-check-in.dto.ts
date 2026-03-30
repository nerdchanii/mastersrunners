import { IsOptional, IsString } from "class-validator";

export class CrewActivityCheckInDto {
  @IsOptional()
  @IsString()
  method?: string;
}
