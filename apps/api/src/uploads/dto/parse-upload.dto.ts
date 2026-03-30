import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class ParseUploadDto {
  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @IsString()
  @IsIn(["FIT", "GPX"])
  fileType!: "FIT" | "GPX";

  @IsString()
  @IsNotEmpty()
  originalFileName!: string;
}
