import { IsNotEmpty, IsString } from "class-validator";

export class CrewActivityQrCheckInDto {
  @IsString()
  @IsNotEmpty()
  qrCode!: string;
}
