import { IsString, IsOptional, MaxLength } from "class-validator";

export class CreatePostCommentDto {
  @IsString()
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  mentionedUserId?: string;
}
