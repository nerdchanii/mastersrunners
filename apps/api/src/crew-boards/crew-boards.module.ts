import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { CrewBoardsRepository } from "./crew-boards.repository.js";
import { CrewBoardsService } from "./crew-boards.service.js";
import { CrewBoardsController } from "./crew-boards.controller.js";

@Module({
  imports: [DatabaseModule],
  controllers: [CrewBoardsController],
  providers: [CrewBoardsRepository, CrewBoardsService],
  exports: [CrewBoardsService],
})
export class CrewBoardsModule {}
