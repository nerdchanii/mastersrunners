import { IsNotEmpty, IsString } from "class-validator";

export class CrewActivityAdminCheckInDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
