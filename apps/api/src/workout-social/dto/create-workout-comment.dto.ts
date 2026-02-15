import { IsString, MaxLength } from "class-validator";

export class CreateWorkoutCommentDto {
  @IsString()
  @MaxLength(500)
  content!: string;
}
