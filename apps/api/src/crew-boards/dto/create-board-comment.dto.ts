import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBoardCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
