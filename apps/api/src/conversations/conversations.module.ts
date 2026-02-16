import { Module } from "@nestjs/common";
import { ConversationsController } from "./conversations.controller.js";
import { ConversationsService } from "./conversations.service.js";
import { ConversationsRepository } from "./repositories/conversations.repository.js";
import { BlockModule } from "../block/block.module.js";

@Module({
  imports: [BlockModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository],
})
export class ConversationsModule {}
