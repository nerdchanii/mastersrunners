import { IsNotEmpty, IsString } from "class-validator";

export class LinkEventWorkoutDto {
  @IsString()
  @IsNotEmpty()
  workoutId!: string;
}
