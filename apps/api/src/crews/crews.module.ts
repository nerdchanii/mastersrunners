import { Module } from "@nestjs/common";
import { CrewsController } from "./crews.controller.js";
import { CrewsService } from "./crews.service.js";
import { CrewRepository } from "./repositories/crew.repository.js";
import { CrewMemberRepository } from "./repositories/crew-member.repository.js";

@Module({
  controllers: [CrewsController],
  providers: [CrewsService, CrewRepository, CrewMemberRepository],
  exports: [CrewRepository, CrewMemberRepository],
})
export class CrewsModule {}
