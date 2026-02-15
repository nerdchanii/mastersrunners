import { Module } from "@nestjs/common";
import { ChallengesController } from "./challenges.controller.js";
import { ChallengesService } from "./challenges.service.js";
import { ChallengeRepository } from "./repositories/challenge.repository.js";
import { ChallengeParticipantRepository } from "./repositories/challenge-participant.repository.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [ChallengesController],
  providers: [ChallengesService, ChallengeRepository, ChallengeParticipantRepository],
  exports: [ChallengesService],
})
export class ChallengesModule {}
