import { IsBoolean } from "class-validator";

export class UpdateWorkoutDto {
  @IsBoolean()
  isPublic!: boolean;
}
