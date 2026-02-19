import { IsString, IsOptional, IsArray, IsUUID, MaxLength } from "class-validator";

export class CreateWorkoutCommentDto {
  @IsString()
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}
