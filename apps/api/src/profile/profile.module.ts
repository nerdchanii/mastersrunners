import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller.js";
import { ProfileService } from "./profile.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { WorkoutsModule } from "../workouts/workouts.module.js";

@Module({
  imports: [AuthModule, WorkoutsModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
