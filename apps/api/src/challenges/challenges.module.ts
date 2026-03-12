import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module.js";

import { ChallengeRepository } from "./repositories/challenge.repository.js";
import { ChallengeParticipantRepository } from "./repositories/challenge-participant.repository.js";
import { ChallengeTeamRepository } from "./repositories/challenge-team.repository.js";
import { ChallengeAggregationService } from "./challenge-aggregation.service.js";
import { ChallengesController } from "./challenges.controller.js";
import { ChallengesService } from "./challenges.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [ChallengesController],
  providers: [
    ChallengesService,
    ChallengeAggregationService,
    ChallengeRepository,
    ChallengeParticipantRepository,
    ChallengeTeamRepository,
  ],
  exports: [ChallengesService, ChallengeAggregationService],
})
export class ChallengesModule {}
