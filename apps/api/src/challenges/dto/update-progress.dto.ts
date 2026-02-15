import { IsNumber } from "class-validator";

export class UpdateProgressDto {
  @IsNumber()
  currentValue!: number;
}
