import { IsIn, IsString } from "class-validator";

export class ChangeCrewMemberRoleDto {
  @IsString()
  @IsIn(["ADMIN", "MEMBER"])
  role!: "ADMIN" | "MEMBER";
}
