import { Module } from "@nestjs/common";
import { CrewsController } from "./crews.controller.js";
import { CrewsService } from "./crews.service.js";
import { CrewRepository } from "./repositories/crew.repository.js";
import { CrewMemberRepository } from "./repositories/crew-member.repository.js";
import { CrewTagRepository } from "./repositories/crew-tag.repository.js";
import { CrewActivityRepository } from "./repositories/crew-activity.repository.js";
import { CrewBanRepository } from "./repositories/crew-ban.repository.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [CrewsController],
  providers: [CrewsService, CrewRepository, CrewMemberRepository, CrewTagRepository, CrewActivityRepository, CrewBanRepository],
  exports: [CrewRepository, CrewMemberRepository],
})
export class CrewsModule {}
