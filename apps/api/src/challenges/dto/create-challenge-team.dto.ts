import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateChallengeTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  teamName!: string;
}
